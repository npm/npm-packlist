'use strict'
const t = require('tap')
const fs = require('fs')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const pack = require('../')
const path = require('path')
const pkg = path.join(__dirname, path.basename(__filename, '.js'))
t.teardown(_ => rimraf.sync(pkg))

t.test('setup', t => {
  rimraf.sync(pkg)
  mkdirp.sync(pkg)
  fs.writeFileSync(pkg + '/package.json', JSON.stringify({
    name: 'test-package',
    version: '1.2.3',
  }))
  mkdirp.sync(pkg + '/nest')
  fs.writeFileSync(pkg + '/nest/package.json', JSON.stringify({
    name: 'nested-package',
    version: '1.2.3',
    files: [ 'index.js' ],
  }))
  fs.writeFileSync(pkg + '/nest/index.js', 'console.log("hi")')
  fs.writeFileSync(pkg + '/nest/foo.js', 'console.log("no")')

  t.end()
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
