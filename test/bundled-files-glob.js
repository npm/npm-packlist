'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

// Verify that the new files[] glob semantics apply to bundled dependencies as
// well, not just the project root. processPackage runs for every package root
// in the walk (including bundled deps), so a bundled dep with `files: ["dist-*"]`
// should pull in dist-cjs/index.js, dist-es/index.js, and dist-other.js -- the
// same regression that cli#7514 reports for the top-level package.
t.test('bundled dep with files: ["dist-*"] expands directory matches', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'root',
      version: '1.0.0',
      main: 'index.js',
      dependencies: {
        bundled: '1.0.0',
      },
      bundleDependencies: ['bundled'],
    }),
    'index.js': '',
    node_modules: {
      bundled: {
        'package.json': JSON.stringify({
          name: 'bundled',
          version: '1.0.0',
          files: ['dist-*'],
        }),
        'dist-cjs': { 'index.js': 'cjs' },
        'dist-es': { 'index.js': 'es' },
        'dist-other.js': 'other',
        'should-not-pack.js': 'nope',
      },
    },
  })

  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files.sort(), [
    'index.js',
    'node_modules/bundled/dist-cjs/index.js',
    'node_modules/bundled/dist-es/index.js',
    'node_modules/bundled/dist-other.js',
    'node_modules/bundled/package.json',
    'package.json',
  ].sort())
})
