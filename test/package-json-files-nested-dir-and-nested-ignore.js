// Show that a nested .npmignore will be skipped over if the
// 'files' array matches a dir that passes by it.
'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: [
      'lib/dir',
    ],
  }),
  lib: {
    dir: {
      'one.js': 'one',
      'two.js': 'two',
      'tre.js': 'tre',
      'for.js': 'for',
    },
    '.npmignore': 'dir/two.js',
    '.DS_Store': 'a store of ds',
  },
})

t.test('package with negated files', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    'lib/dir/for.js',
    'lib/dir/one.js',
    'lib/dir/tre.js',
    'package.json',
  ])
})
