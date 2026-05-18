'use strict'

const t = require('tap')
const { join } = require('node:path')
const packlist = require('../lib/index.js')

// minimal arborist-tree shape that PackWalker consumes.
const fakeTree = (dir, pkg) => ({
  path: dir,
  package: pkg,
  isProjectRoot: true,
  edgesOut: new Map(),
  inventory: new Map(),
  workspaces: null,
})

t.test('globalIgnoreFile rules apply on top of defaults', async t => {
  const root = t.testdir({
    'global-ignore': '*.iml\n.idea/\n',
    pkg: {
      'package.json': JSON.stringify({ name: 'a', version: '1.0.0' }),
      'index.js': '"use strict"',
      'foo.iml': 'ide metadata',
      '.idea': { 'workspace.xml': '<x/>' },
    },
  })
  const dir = join(root, 'pkg')

  const files = await packlist(fakeTree(dir, { name: 'a', version: '1.0.0' }), {
    path: dir,
    globalIgnoreFile: join(root, 'global-ignore'),
  })

  t.same(files.sort(), ['index.js', 'package.json'].sort(), 'globally-ignored files are excluded')
})

t.test('globalIgnoreFile rules apply when package has local .npmignore', async t => {
  const root = t.testdir({
    'global-ignore': '*.iml\n',
    pkg: {
      'package.json': JSON.stringify({ name: 'b', version: '1.0.0' }),
      'index.js': '"use strict"',
      'scratch.tmp': 'local-only',
      'foo.iml': 'ide metadata',
      '.npmignore': '*.tmp\n',
    },
  })
  const dir = join(root, 'pkg')

  const files = await packlist(fakeTree(dir, { name: 'b', version: '1.0.0' }), {
    path: dir,
    globalIgnoreFile: join(root, 'global-ignore'),
  })

  t.notOk(files.includes('foo.iml'), 'global rule still applies')
  t.notOk(files.includes('scratch.tmp'), 'local .npmignore still applies')
  t.ok(files.includes('index.js'), 'unrelated files kept')
})

t.test('files-field directory entry overrides global rule', async t => {
  // Documented carve-out: a `files` directory includes everything under it, even
  // entries a global rule would otherwise exclude. The `!/lib/**` rule produced by
  // processPackage runs on the root walker after globalRules, and child walkers do
  // not reapply globalRules, so the include wins both at the root and inside lib/.
  const root = t.testdir({
    'global-ignore': '*.iml\n',
    pkg: {
      'package.json': JSON.stringify({ name: 'c', version: '1.0.0', files: ['lib'] }),
      lib: {
        'index.js': '"use strict"',
        'inside.iml': 'tracked despite global ignore',
        nested: {
          'deep.iml': 'also tracked',
        },
      },
    },
  })
  const dir = join(root, 'pkg')

  const files = await packlist(fakeTree(dir, { name: 'c', version: '1.0.0', files: ['lib'] }), {
    path: dir,
    globalIgnoreFile: join(root, 'global-ignore'),
  })

  t.ok(files.includes('lib/index.js'), 'files-field directory contents included')
  t.ok(files.includes('lib/inside.iml'), 'globally-ignored file in a files-field directory survives')
  t.ok(files.includes('lib/nested/deep.iml'), 'globally-ignored file in a nested subdir of a files-field directory survives')
})

t.test('missing globalIgnoreFile is silently ignored', async t => {
  const root = t.testdir({
    pkg: {
      'package.json': JSON.stringify({ name: 'd', version: '1.0.0' }),
      'index.js': '"use strict"',
    },
  })
  const dir = join(root, 'pkg')

  const files = await packlist(fakeTree(dir, { name: 'd', version: '1.0.0' }), {
    path: dir,
    globalIgnoreFile: join(root, 'does-not-exist'),
  })

  t.ok(files.includes('index.js'), 'pack still succeeds when global file is absent')
})

t.test('rules apply across the walker tree', async t => {
  const root = t.testdir({
    'global-ignore': '*.iml\n',
    pkg: {
      'package.json': JSON.stringify({ name: 'e', version: '1.0.0' }),
      'index.js': '"use strict"',
      sub: { 'foo.iml': 'ignored', 'keep.js': '"use strict"' },
    },
  })
  const dir = join(root, 'pkg')

  const files = await packlist(fakeTree(dir, { name: 'e', version: '1.0.0' }), {
    path: dir,
    globalIgnoreFile: join(root, 'global-ignore'),
  })

  t.ok(files.includes('sub/keep.js'), 'kept subdir file present')
  t.notOk(files.includes('sub/foo.iml'), 'global rule applied to subdirectories')
})

t.test('bundled dependencies are not subject to global rules', async t => {
  // Bundled deps are third-party code we ship as-is.
  // Applying user-level ignores would surprise the consumer.
  const root = t.testdir({
    'global-ignore': '*.iml\n',
    pkg: {
      'package.json': JSON.stringify({
        name: 'f',
        version: '1.0.0',
        bundleDependencies: ['dep'],
        dependencies: { dep: '1.0.0' },
      }),
      'index.js': '"use strict"',
      node_modules: {
        dep: {
          'package.json': JSON.stringify({ name: 'dep', version: '1.0.0' }),
          'foo.iml': 'bundled file that should ship',
        },
      },
    },
  })
  const dir = join(root, 'pkg')

  // Build a tree that bundles `dep`.
  // Real arborist trees are heavy; we assemble the minimum PackWalker reads.
  const depPath = join(dir, 'node_modules', 'dep')
  const depNode = {
    path: depPath,
    package: { name: 'dep', version: '1.0.0' },
    isLink: false,
    target: null,
    edgesOut: new Map(),
  }
  depNode.target = depNode
  const tree = {
    path: dir,
    package: { name: 'f', version: '1.0.0', bundleDependencies: ['dep'] },
    isProjectRoot: true,
    edgesOut: new Map([['dep', { to: depNode, peer: false, dev: false }]]),
    workspaces: null,
  }

  const files = await packlist(tree, {
    path: dir,
    globalIgnoreFile: join(root, 'global-ignore'),
  })
  t.ok(
    files.some(f => f.endsWith('node_modules/dep/foo.iml')),
    'bundled dep keeps file the global rule would have excluded'
  )
})
