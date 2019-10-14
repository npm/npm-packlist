// cannot include package-lock.json in the root
const t = require('tap')
const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: ['.npmignore', 'package-lock.json']
  }),
  '.npmignore': `
!package-lock.json
`,
  'package-lock.json': '{}',
})

const packlist = require('../')
t.test('try to include package-lock.json but cannot', async t => {
  t.matchSnapshot(packlist.sync({path: pkg}))
  await t.resolveMatchSnapshot(packlist({path: pkg}))
})
