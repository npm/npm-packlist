'use strict'

const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: [
      'lib',
      '!lib/one',
    ],
  }),
  lib: {
    one: 'one',
    two: 'two',
    tre: 'tre',
    for: 'for',
    '.npmignore': 'two',
    '.DS_Store': 'a store of ds',
  },
})

t.test('package with negated files', async (t) => {
  const files = await packlist({ path: pkg })
  t.same(files, [
    'lib/for',
    'lib/tre',
    'package.json',
  ])
})
