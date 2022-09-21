'use strict'

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
  const files = await packlist({ path: pkg })
  t.same(files, [
    'lib/.npmignore',
    'lib/sub/for.js',
    'lib/sub/one.js',
    'lib/sub/tre.js',
    'package.json',
  ])
})
