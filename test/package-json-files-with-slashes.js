// In v11+, with pure glob semantics for `files[]`, an explicit file path no
// longer overrides a nested .npmignore. The .npmignore wins, because the
// `files[]` array is a pure inclusion filter and ignore-walk applies its
// usual gitignore-style precedence within subdirectories. Authors who need
// a file to ship despite a nested .npmignore must remove the .npmignore
// rule (this matches how `node-glob`-style consumers reason about it).
'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: [
      './fiv.js',
      '/lib/one.js',
      '/lib/two.js',
      '/lib/tre.js',
      './lib/for.js',
    ],
  }),
  'fiv.js': 'fiv',
  lib: {
    'one.js': 'one',
    'two.js': 'two',
    'tre.js': 'tre',
    'for.js': 'for',
    'fiv.js': 'fiv',
    '.npmignore': 'two.js',
    '.DS_Store': 'a store of ds',
  },
})

t.test('package with slash files', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  // lib/two.js is dropped because lib/.npmignore excludes it; under v11
  // pure-glob semantics, files[] does not override nested .npmignore rules.
  t.same(files, [
    'fiv.js',
    'lib/for.js',
    'lib/one.js',
    'lib/tre.js',
    'package.json',
  ])
})
