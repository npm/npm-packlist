'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: [
      'lib/sub/*.js',
      'lib/.npmignore',
    ],
  }),
  lib: {
    '.npmignore': 'two.js',
    sub: {
      'one.js': 'one',
      'two.js': 'two',
      'tre.js': 'tre',
      'for.js': 'for',
    },
    '.DS_Store': 'a store of ds',
  },
})

t.test('package with negated files', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist({ path: pkg, tree })
  t.same(files, [
    'lib/.npmignore',
    'lib/sub/for.js',
    'lib/sub/one.js',
    'lib/sub/tre.js',
    'package.json',
  ])
})
