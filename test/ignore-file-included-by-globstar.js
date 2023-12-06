'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

t.test('exclude certain files always', async t => {
  const path = t.testdir({
    '.npmrc': 'secrets=true',
    '.git': {
      HEAD: 'empty',
    },
    node_modules: {
      foo: {
        'index.js': '',
      },
    },
    subdir: {
      'other.js': '',
      '.npmrc': 'sneaky=true',
    },
    'index.js': '',
    'glorp.txt': '',
    'package.json': JSON.stringify({
      name: '@npmcli/globstar-test',
      version: '1.0.0',
      files: ['*'],
    }),
    'package-lock.json': '{}',
    'yarn.lock': '{}',
    'pnpm-lock.yaml': '{}',
  })
  const arborist = new Arborist({ path })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    'index.js',
    'subdir/other.js',
    'package.json',
    'glorp.txt',
  ])
})

t.test('include a globstar, then exclude one of them', async (t) => {
  const path = t.testdir({
    'bar.js': '',
    bar: {
      'bar.js': '',
    },
    'glorp.txt': '',
    'package.json': JSON.stringify({
      name: 'cli-issue-2009',
      version: '1.0.0',
      files: [
        '**/*.js',
        '!foo.js',
      ],
    }),
  })

  const arborist = new Arborist({ path })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    'bar.js',
    'bar/bar.js',
    'package.json',
  ])
})
