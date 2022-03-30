// cannot exclude package.json in the root
'use strict'

const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: ['.npmignore', '!package.json'],
  }),
  '.npmignore': 'package.json',
})

t.test('try to exclude package.json but cannot', async (t) => {
  const files = await packlist({ path: pkg })
  t.same(files, [
    '.npmignore',
    'package.json',
  ])
})
