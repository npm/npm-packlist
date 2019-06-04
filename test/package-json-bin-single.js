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
  bin: '__bin',
  files: [
    'lib'
  ]
}

t.test('setup', t => {
  rimraf.sync(pkg)
  mkdirp.sync(pkg)
  fs.writeFileSync(
    path.join(pkg, 'package.json'),
    JSON.stringify(json, null, 2)
  )

  fs.writeFileSync(
    path.join(pkg, '__bin'),
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
    t.matchSnapshot(files)
    t.end()
  }

  t.test('sync', t => check(pack.sync({ path: pkg }), t))
  t.test('async', t => pack({ path: pkg }).then(files => check(files, t)))

  t.end()
})
