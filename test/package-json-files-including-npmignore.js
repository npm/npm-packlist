'use strict'

const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: [
      'lib/sub/*.js',
      '.npmignore',
    ],
  }),
  lib: {
    sub: {
      'one.js': 'one',
      'two.js': 'two',
      'tre.js': 'tre',
      'for.js': 'for',
    },
    '.DS_Store': 'a store of ds',
  },
  '.npmignore': 'two.js',
})

t.test('package with negated files', async (t) => {
  const files = await packlist({ path: pkg })
  t.same(files, [
    '.npmignore',
    'lib/sub/for.js',
    'lib/sub/one.js',
    'lib/sub/tre.js',
    'package.json',
  ])
})
