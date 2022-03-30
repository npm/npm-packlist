'use strict'

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
  const files = await packlist({ path: pkg })
  t.same(files, [
    'nest/foo.js',
    'nest/index.js',
    'nest/package.json',
    'package.json',
  ])
})
