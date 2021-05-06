const t = require('tap')
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

const packlist = require('../')
t.test('package with negated files', async t => {
  t.matchSnapshot(packlist.sync({path: pkg}))
  await t.resolveMatchSnapshot(packlist({path: pkg}))
})
