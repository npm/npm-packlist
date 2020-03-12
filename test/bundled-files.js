'use strict'
const fs = require('fs')
const path = require('path')

const rimraf = require('rimraf')
const t = require('tap')

const pack = require('../')

const elfJS = `
module.exports = elf =>
  console.log("i'm a elf")
`

const pkg = t.testdir({
  'package.json': JSON.stringify({
    'name': 'test-package',
    'version': '3.1.4',
    'main': 'elf.js',
    'bundleDependencies': [
      'history'
    ],
    files: [ 'elf.js' ]
  }),
  'elf.js': elfJS,
  '.npmrc': 'packaged=false',
  node_modules: {
    history: {
      'package.json': JSON.stringify({
        name: '@npmwombat/history',
        version: '1.0.0',
        main: 'index.js'
      }),
      'index.js': elfJS,
    }
  }
})

t.test('includes bundled dependency', function (t) {
  const check = (files, t) => {
    t.matchSnapshot(files)
    t.end()
  }

  t.test('sync', t => check(pack.sync({ path: pkg }), t))
  t.test('async', t => pack({ path: pkg }).then(files => check(files, t)))

  t.end()
})
