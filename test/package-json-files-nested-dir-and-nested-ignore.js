// Show that a nested .npmignore will be skipped over if the
// 'files' array matches a dir that passes by it.
const t = require('tap')
const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: [
      'lib/dir',
    ],
  }),
  lib: {
    dir: {
      'one.js': 'one',
      'two.js': 'two',
      'tre.js': 'tre',
      'for.js': 'for',
    },
    '.npmignore': 'dir/two.js',
    '.DS_Store': 'a store of ds',
  },
})

const packlist = require('../')
t.test('package with negated files', async t => {
  await t.resolveMatchSnapshot(packlist({ path: pkg }))
})
