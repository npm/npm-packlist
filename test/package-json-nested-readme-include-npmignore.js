// include readme.* files anywhere in a package
'use strict'

const t = require('tap')
const packlist = require('../')

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

t.test('package with negated files', async (t) => {
  const files = await packlist({ path: pkg })
  t.same(files, [
    'lib/a/a.js',
    'lib/a/b/b.js',
    'lib/a/b/c/c.js',
    'package.json',
    'lib/a/b/c/readme.md',
    'lib/a/b/readme.md',
    'lib/a/readme.md',
  ])
})
