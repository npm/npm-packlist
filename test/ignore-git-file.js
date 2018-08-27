'use strict'
const fs = require('fs')
const path = require('path')

const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const t = require('tap')

const pack = require('../')

const pkg = path.join(__dirname, path.basename(__filename, '.js'))
t.teardown(_ => rimraf.sync(pkg))

const elfJS = `
module.exports = elf =>
  console.log("i'm a elf")
`

const json = {
  'name': 'test-package',
  'version': '3.1.4',
  'main': 'elf.js'
}

const expect = [
  'normal-file.txt'
]

t.test('setup', t => {
  rimraf.sync(pkg)
  mkdirp.sync(pkg)

  fs.writeFileSync(
    path.join(pkg, 'normal-file.txt'),
    "Hello world!"
  )

  fs.writeFileSync(
    path.join(pkg, '.git'),
    "gitdir: /absolute/file/path"
  )

  t.end()
})

t.test('follows npm package ignoring rules', function (t) {
  const check = (files, t) => {
    t.same(files, expect)
    t.end()
  }

  t.test('sync', t => check(pack.sync({ path: pkg }), t))
  t.test('async', t => pack({ path: pkg }).then(files => check(files, t)))

  t.end()
})
