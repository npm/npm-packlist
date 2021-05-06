'use strict'
const t = require('tap')
const pack = require('../')
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
t.test('includes nested package.json file', function (t) {
  const check = (files, t) => {
    t.matchSnapshot(files)
    t.end()
  }

  t.test('sync', t => check(pack.sync({ path: pkg }), t))
  t.test('async', t => pack({ path: pkg }).then(files => check(files, t)))

  t.end()
})
