'use strict'
const fs = require('fs')
const path = require('path')

const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const t = require('tap')

const pack = require('..')

const pkg = path.join(__dirname, path.basename(__filename, '.js'))
const deppkg = path.join(__dirname, path.basename(__filename, '.js') + '_history')
t.teardown(_ => {
  rimraf.sync(pkg)
  rimraf.sync(deppkg)
})

const elfJS = `
module.exports = elf =>
  console.log("i'm a elf")
`

const json = {
  'name': 'test-package',
  'version': '3.1.4',
  'main': 'elf.js',
  'bundleDependencies': [
    '@npmwombat/history'
  ]
}

const expect = [
  'package.json',
  'elf.js',
  'node_modules/@npmwombat/history/index.js',
  'node_modules/@npmwombat/history/package.json'
]

t.test('setup', t => {
  rimraf.sync(pkg)
  mkdirp.sync(pkg)
  fs.writeFileSync(
    path.join(pkg, 'package.json'),
    JSON.stringify(json, null, 2)
  )

  fs.writeFileSync(
    path.join(pkg, 'elf.js'),
    elfJS
  )

  fs.writeFileSync(
    path.join(pkg, '.npmrc'),
    'packaged=false'
  )

  const historyDir = path.join(pkg, 'node_modules/@npmwombat/history')
  mkdirp.sync(deppkg)
  fs.writeFileSync(
    path.join(deppkg, 'package.json'),
    JSON.stringify({
      name: '@npmwombat/history',
      version: '1.0.0',
      main: 'index.js'
    }, null, 2)
  )

  mkdirp.sync(path.join(pkg, 'node_modules/@npmwombat'))
  fs.writeFileSync(
    path.join(deppkg, 'index.js'),
    elfJS
  )

  fs.symlinkSync(deppkg, historyDir)

  t.end()
})

t.test('includes bundled dependency', function (t) {
  const check = (files, t) => {
    t.same(files, expect)
    t.end()
  }

  t.test('sync', t => check(pack.sync({ path: pkg }), t))
  t.test('async', t => pack({ path: pkg }).then(files => check(files, t)))

  t.end()
})
