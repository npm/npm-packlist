'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    name: 'test-package',
    version: '1.2.3',
  }),
  nest: {
    'package.json': JSON.stringify({
      name: 'nested-package',
      version: '1.2.3',
      files: ['index.js'],
    }),
    'index.js': 'console.log("hi")',
    'foo.js': 'console.log("no")',
  },
})

t.test('includes nested package.json file', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    'nest/foo.js',
    'nest/index.js',
    'nest/package.json',
    'package.json',
  ])
})
