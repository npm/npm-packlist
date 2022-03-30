// cannot exclude npm-shrinkwrap.json in the root
'use strict'

const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: ['.npmignore', '!npm-shrinkwrap.json'],
  }),
  '.npmignore': 'npm-shrinkwrap.json',
  'npm-shrinkwrap.json': '{}',
})

t.test('package with negated files', async (t) => {
  const files = await packlist({ path: pkg })
  t.same(files, [
    '.npmignore',
    'npm-shrinkwrap.json',
    'package.json',
  ])
})
