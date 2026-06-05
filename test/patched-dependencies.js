'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

t.test('a dedicated patch dir is dropped even when listed in "files"', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'p',
      version: '1.0.0',
      files: ['lib', 'patches'],
      patchedDependencies: { 'abbrev@2.0.0': 'patches/abbrev@2.0.0.patch' },
    }),
    lib: { 'index.js': 'code' },
    patches: { 'abbrev@2.0.0.patch': 'the patch' },
  })

  // a "files" entry that names the patch dir should produce a warning
  const warnings = []
  const onLog = (level, ...args) => {
    if (level === 'warn' && args[0] === 'patched-dependencies') {
      warnings.push(args[1])
    }
  }
  process.on('log', onLog)
  t.teardown(() => process.removeListener('log', onLog))

  const tree = await new Arborist({ path: pkg }).loadActual()
  const files = await packlist(tree)

  t.same(files, ['lib/index.js', 'package.json'], 'the now-empty patch dir is excluded')
  t.match(warnings, [/excluding "patches\/abbrev@2.0.0.patch"/], 'warns that the patch file was dropped')
})

t.test('a patch file in a shared dir is dropped without dropping the rest of the dir', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'p',
      version: '1.0.0',
      patchedDependencies: { 'abbrev@2.0.0': 'src/abbrev@2.0.0.patch' },
    }),
    src: { 'index.js': 'code', 'abbrev@2.0.0.patch': 'the patch' },
  })
  const tree = await new Arborist({ path: pkg }).loadActual()
  const files = await packlist(tree)
  t.notOk(files.includes('src/abbrev@2.0.0.patch'), 'the patch file is excluded')
  t.ok(files.includes('src/index.js'), 'sibling source in the same dir still ships')
})

t.test('malformed, absolute, and escaping patch paths are skipped safely', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'p',
      version: '1.0.0',
      patchedDependencies: {
        // a non-string value is skipped
        'bad@1.0.0': { not: 'a string' },
        // an absolute path is never packed, so it is skipped
        'abs@1.0.0': '/etc/passwd.patch',
        // a path that escapes the package root is skipped
        'esc@1.0.0': '../evil.patch',
        // a valid relative patch file is excluded
        'abbrev@2.0.0': 'patches/abbrev@2.0.0.patch',
      },
    }),
    'index.js': 'code',
    patches: { 'abbrev@2.0.0.patch': 'the patch' },
  })
  const tree = await new Arborist({ path: pkg }).loadActual()
  const files = await packlist(tree)
  t.notOk(files.some((f) => f.startsWith('patches')), 'the valid patch file is excluded')
  t.ok(files.includes('index.js'), 'unrelated source still ships')
})

t.test('a bundled dependency with patchedDependencies does not prune its own files', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'p',
      version: '1.0.0',
      dependencies: { dep: '1.0.0' },
      bundleDependencies: ['dep'],
    }),
    'index.js': 'code',
    node_modules: {
      dep: {
        // patchedDependencies here must be ignored: it is only honored in a root manifest
        'package.json': JSON.stringify({
          name: 'dep',
          version: '1.0.0',
          patchedDependencies: { 'x@1.0.0': 'patches/x@1.0.0.patch' },
        }),
        'index.js': 'dep code',
        patches: { 'x@1.0.0.patch': 'should still ship from a bundled dep' },
      },
    },
  })
  const tree = await new Arborist({ path: pkg }).loadActual()
  const files = await packlist(tree)
  t.ok(files.includes('node_modules/dep/patches/x@1.0.0.patch'),
    'the bundled dep\'s patch dir is not pruned')
})
