// cannot exclude readme.md in the root
const t = require('tap')
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

const packlist = require('../')
t.test('try to exclude package.json but cannot', async t => {
  t.matchSnapshot(packlist.sync({ path: pkg }))
  await t.resolveMatchSnapshot(packlist({ path: pkg }))
})
