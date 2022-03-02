// cannot exclude package.json in the root
const t = require('tap')
const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: ['.npmignore', '!package.json'],
  }),
  '.npmignore': 'package.json',
})

const packlist = require('../')
t.test('try to exclude package.json but cannot', async t => {
  t.matchSnapshot(packlist.sync({ path: pkg }))
  await t.resolveMatchSnapshot(packlist({ path: pkg }))
})
