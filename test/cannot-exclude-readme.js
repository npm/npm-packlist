// cannot exclude readme.md in the root
const t = require('tap')
const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: ['.npmignore', '!readme.md']
  }),
  '.npmignore': 'readme.md',
  'readme.md': 'hello',
})

const packlist = require('../')
t.test('try to exclude package.json but cannot', async t => {
  t.matchSnapshot(packlist.sync({path: pkg}))
  await t.resolveMatchSnapshot(packlist({path: pkg}))
})
