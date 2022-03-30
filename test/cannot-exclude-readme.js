// cannot exclude readme.md in the root
'use strict'

const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: ['.npmignore', '!readme.md'],
  }),
  '.npmignore': 'readme.md\nlicense.md\nhistory.md\n*.xyz',
  'readme.md': 'hello',
  'license.md': 'hello',
  'history.md': 'hello',
  'changes.md': 'hello',
  'changelog.xyz': 'hello',
  'notice.md': 'hello',
})

t.test('try to exclude package.json but cannot', async (t) => {
  const files = await packlist({ path: pkg })
  t.same(files, [
    '.npmignore',
    'package.json',
    'license.md',
    'readme.md',
  ])
})
