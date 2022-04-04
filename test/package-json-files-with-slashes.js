// In v1, this would exclude the 'lib/two.js' file, because
// the .npmignore is deeper in the tree and thus had higher
// precedence.  In v2, because /lib/two.js is in the files
// list as a file path, it will be included no matter what.
const t = require('tap')
const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: [
      '/lib/one.js',
      '/lib/two.js',
      '/lib/tre.js',
      '/lib/for.js',
    ],
  }),
  lib: {
    'one.js': 'one',
    'two.js': 'two',
    'tre.js': 'tre',
    'for.js': 'for',
    '.npmignore': 'two.js',
    '.DS_Store': 'a store of ds',
  },
})
const packlist = require('../')
t.test('package with negated files', async t => {
  await t.resolveMatchSnapshot(packlist({ path: pkg }))
})
