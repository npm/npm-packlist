'use-strict'
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
  name: 'test-package',
  version: '3.1.4',
  main: '__main.js',
  browser: 'browser.js',
  files: [
    'elf.js',
    'deps/foo/config/config.gypi'
  ]
}

const expect = [
  'package.json',
  '__main.js',
  'browser.js',
  'elf.js',
  'deps/foo/config/config.gypi',
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
    path.join(pkg, '__main.js'),
    elfJS
  )

  fs.writeFileSync(
    path.join(pkg, 'browser.js'),
    elfJS
  )

  fs.writeFileSync(
    path.join(pkg, '.npmrc'),
    'packaged=false'
  )

  // don't bother even reading this file, because we have files list
  fs.writeFileSync(
    path.join(pkg, '.npmignore'),
    '!.npmignore\n!dummy\npackage.json'
  )

  fs.writeFileSync(
    path.join(pkg, 'dummy'),
    'foo'
  )

  const buildDir = path.join(pkg, 'build')
  mkdirp.sync(buildDir)
  fs.writeFileSync(
    path.join(buildDir, 'config.gypi'),
    "i_wont_be_included='with any luck'"
  )

  const depscfg = path.join(pkg, 'deps/foo/config')
  mkdirp.sync(depscfg)
  fs.writeFileSync(
    path.join(depscfg, 'config.gypi'),
    "i_will_be_included='with any luck'"
  )

  fs.writeFileSync(
    path.join(buildDir, 'npm-debug.log'),
    '0 lol\n'
  )

  const gitDir = path.join(pkg, '.git')
  mkdirp.sync(gitDir)
  fs.writeFileSync(
    path.join(gitDir, 'gitstub'),
    "won't fool git, also won't be included"
  )

  const historyDir = path.join(pkg, 'node_modules/history')
  mkdirp.sync(historyDir)
  fs.writeFileSync(
    path.join(historyDir, 'README.md'),
    "please don't include me"
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
