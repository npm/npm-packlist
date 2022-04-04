// include readme.* files anywhere in a package
const t = require('tap')
const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: ['.npmignore', 'lib'],
  }),
  lib: {
    a: {
      b: {
        c: {
          'readme.md': 'one',
          'file.txt': 'one',
          'c.js': 'one',
        },
        'readme.md': 'one',
        'file.txt': 'one',
        'b.js': 'one',
      },
      'readme.md': 'one',
      'file.txt': 'one',
      'a.js': 'one',
    },
  },
  test: {
    a: {
      b: {
        c: {
          'readme.md': 'one',
          'file.txt': 'one',
          'c.js': 'one',
        },
        'readme.md': 'one',
        'file.txt': 'one',
        'b.js': 'one',
      },
      'readme.md': 'one',
      'file.txt': 'one',
      'a.js': 'one',
    },
  },
  '.npmignore': `
*
!*.js
!**/*.js
test
`,
})

const packlist = require('../')
t.test('package with negated files', async t => {
  await t.resolveMatchSnapshot(packlist({ path: pkg }))
})
