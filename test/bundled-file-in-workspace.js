'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

t.test('correctly filters files from workspace subdirectory', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'root',
      version: '1.0.0',
      files: ['docs/*.txt'],
      main: 'index.js',
      workspaces: ['./docs'],
    }),
    'index.js': '',
    docs: {
      'package.json': JSON.stringify({
        name: 'docs',
        version: '1.0.0',
        main: 'index.js',
        files: ['*.txt'],
      }),
      'bar.txt': '',
      'foo.txt': '',
      'readme.md': '',
      test: {
        'index.js': '',
      },
    },
  })

  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist({ path: pkg, tree })
  t.same(files, [
    'index.js',
    'package.json',
    'docs/readme.md', // readme.md is always included
    'docs/bar.txt',
    'docs/foo.txt',
  ])
})

t.test('does not filter based on package.json if subdirectory is not a workspace', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'root',
      version: '1.0.0',
      files: ['docs/*.txt'],
      main: 'index.js',
      // this test needs a workspace to exist, but that workspace cannot be the one we include
      // files from
      workspaces: ['./unrelated'],
    }),
    'index.js': '',
    docs: {
      'package.json': JSON.stringify({
        name: 'docs',
        version: '1.0.0',
        main: 'index.js',
        files: ['bar.txt', 'foo.txt'],
      }),
      'bar.txt': '',
      'baz.txt': '',
      'foo.txt': '',
      'readme.md': '',
      test: {
        'index.js': '',
      },
    },
    unrelated: {
      'package.json': JSON.stringify({
        name: 'unrelated',
        version: '1.0.0',
        main: 'index.js',
      }),
      'index.js': '',
    },
  })

  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist({ path: pkg, tree })
  t.same(files, [
    'index.js',
    'package.json',
    'docs/readme.md', // readme.md is always included
    'docs/bar.txt',
    'docs/baz.txt', // was _not_ filtered
    'docs/foo.txt',
  ])
})
