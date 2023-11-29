// readme rules can be overridden by files array
'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: ['.npmignore', 'lib'],
  }),
  lib: {
    '.npmignore': `
    *
    !*.js
    !**/*.js
    test
    `,
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
})

t.test('package with negated files', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    'lib/a/a.js',
    'lib/a/b/b.js',
    'lib/a/b/c/c.js',
    'package.json',
  ])
})
