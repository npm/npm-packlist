// In v1, this would exclude the 'lib/two.js' file, because
// the .npmignore is deeper in the tree and thus had higher
// precedence.  In v2, because /lib/two.js is in the files
// list as a file path, it will be included no matter what.
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
  t.same(files, [
    'fiv.js',
    'lib/for.js',
    'lib/one.js',
    'lib/tre.js',
    'lib/two.js',
    'package.json',
  ])
})
