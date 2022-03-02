// cannot exclude npm-shrinkwrap.json in the root
const t = require('tap')
const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: ['.npmignore', '!npm-shrinkwrap.json'],
  }),
  '.npmignore': 'npm-shrinkwrap.json',
  'npm-shrinkwrap.json': '{}',
})

const packlist = require('../')
t.test('package with negated files', async t => {
  t.matchSnapshot(packlist.sync({ path: pkg }))
  await t.resolveMatchSnapshot(packlist({ path: pkg }))
})
