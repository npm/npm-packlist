// ensure we don't get files more than one time, even if specified
// in ways that will have them included from multiple directions
const t = require('tap')
const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: [
      'lib',
      '/lib/*.js',
      'lib/*.js',
      '/lib/one.js',
      'lib/one.js',
      'lib/one.*',
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
  t.matchSnapshot(packlist.sync({path: pkg}))
  await t.resolveMatchSnapshot(packlist({path: pkg}))
})
