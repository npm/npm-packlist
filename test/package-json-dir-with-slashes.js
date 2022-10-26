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
      '/lib',
      './lib2',
    ],
  }),
  lib: {
    'one.js': 'one',
    'two.js': 'two',
    'tre.js': 'tre',
    'for.js': 'for',
    '.npmignore': 'two.js',
  },
  lib2: {
    'fiv.js': 'fiv',
    '.DS_Store': 'a store of ds',
  },
})

t.test('package with slash directories', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    'lib2/fiv.js',
    'lib/for.js',
    'lib/one.js',
    'lib/tre.js',
    'package.json',
  ])
})
