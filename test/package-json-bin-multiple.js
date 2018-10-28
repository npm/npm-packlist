'use strict'
const fs = require('fs')
const path = require('path')

const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const t = require('tap')

const pack = require('../')

const pkg = path.join(__dirname, path.basename(__filename, '.js'))
t.teardown(_ => rimraf.sync(pkg))

const bin = `
#!/usr/bin/env node
require("../lib/elf")()
`

const elfJS = `
module.exports = elf =>
  console.log("i'm angry about elves")
`

const json = {
  name: 'test-package',
  version: '1.6.2',
  bin: {
    bar: '__bin_bar',
    foo: '__bin_foo'
  },
  files: [
    'lib'
  ]
}

const expect = [
  'package.json',
  '__bin_bar',
  '__bin_foo',
  'lib/elf.js'
]

t.test('setup', t => {
  rimraf.sync(pkg)
  mkdirp.sync(pkg)
  fs.writeFileSync(
    path.join(pkg, 'package.json'),
    JSON.stringify(json, null, 2)
  )

  fs.writeFileSync(
    path.join(pkg, '__bin_foo'),
    bin
  )

  fs.writeFileSync(
    path.join(pkg, '__bin_bar'),
    bin
  )

  const libDir = path.join(pkg, 'lib')
  mkdirp.sync(libDir)
  fs.writeFileSync(
    path.join(libDir, 'elf.js'),
    elfJS
  )

  fs.writeFileSync(
    path.join(pkg, 'dummy'),
    'needs to be ignored'
  )

  t.end()
})

t.test('follows npm package ignoring rules', t => {
  const check = (files, t) => {
    t.same(files, expect)
    t.end()
  }

  t.test('sync', t => check(pack.sync({ path: pkg }), t))
  t.test('async', t => pack({ path: pkg }).then(files => check(files, t)))

  t.end()
})
