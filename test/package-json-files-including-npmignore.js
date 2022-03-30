const t = require('tap')
const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: [
      'lib/sub/*.js',
      '.npmignore',
    ],
  }),
  lib: {
    sub: {
      'one.js': 'one',
      'two.js': 'two',
      'tre.js': 'tre',
      'for.js': 'for',
    },
    '.DS_Store': 'a store of ds',
  },
  '.npmignore': 'two.js',
})

const packlist = require('../')
t.test('package with negated files', async t => {
  await t.resolveMatchSnapshot(packlist({ path: pkg }))
})
