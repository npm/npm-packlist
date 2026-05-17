'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('..')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: [
      'dist-*',
    ],
  }),
  'dist-cjs': {
    'index.js': 'cjs',
  },
  'dist-es': {
    'index.js': 'es',
  },
  'dist-other.js': 'other',
})

t.test('package with dist-* files pattern', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)

  t.match(files, [
    'dist-other.js',
    'dist-cjs/index.js',
    'dist-es/index.js',
    'package.json',
  ])
})
