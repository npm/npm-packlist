'use strict'
const fs = require('fs')
const path = require('path')

const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const t = require('tap')

const pack = require('../')

const pkg = path.join(__dirname, path.basename(__filename, '.js'))
t.teardown(_ => rimraf.sync(pkg))

t.test('setup', t => {
  rimraf.sync(pkg)
  mkdirp.sync(pkg + '/lib')
  mkdirp.sync(pkg + '/core')
  fs.writeFileSync(pkg + '/lib/core', 'excluded dump file')
  fs.writeFileSync(pkg + '/package.json', JSON.stringify({
    name: 'test-package',
    version: '1.2.3',
  }))
  fs.writeFileSync(pkg + '/package-lock.json', JSON.stringify({
    lock: 'file',
    include: false,
  }))
  fs.writeFileSync(pkg + '/yarn.lock', JSON.stringify({
    lock: 'file',
    include: false,
  }))
  fs.writeFileSync(pkg + '/lib/package-lock.json', JSON.stringify({
    lock: 'file',
    include: true,
  }))
  fs.writeFileSync(pkg + '/lib/yarn.lock', JSON.stringify({
    lock: 'file',
    include: true,
  }))
  fs.writeFileSync(pkg + '/core/include-me.txt', 'please include me')
  t.end()
})


t.test('follows npm package ignoring rules', function (t) {
  const check = (files, t) => {
    t.matchSnapshot(files)
    t.end()
  }

  t.test('sync', t => check(pack.sync({ path: pkg }), t))
  t.test('async', t => pack({ path: pkg }).then(files => check(files, t)))

  t.end()
})
