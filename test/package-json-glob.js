'use strict'

const fs = require('fs')
const path = require('path')

const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const t = require('tap')

const pack = require('../')

const pkg = path.join(__dirname, path.basename(__filename, '.js'))
t.teardown(_ => rimraf.sync(pkg))

const json = {
  name: 'test-package',
  version: '1.6.2',
  files: [
    'dist/**/!(*.test.*)'
  ]
}

const expect = [
  'package.json',
  'dist/index.d.ts',
  'dist/index.js',
  'dist/lib/util.d.ts',
  'dist/lib/util.js'
]

t.test('setup', t => {
  rimraf.sync(pkg)
  mkdirp.sync(pkg)
  fs.writeFileSync(path.join(pkg, 'package.json'), JSON.stringify(json, null, 2))

  const srcDir = path.join(pkg, 'src')
  mkdirp.sync(srcDir)
  fs.writeFileSync(path.join(srcDir, 'index.ts'), 'export const x = () => console.log("index")')
  fs.writeFileSync(path.join(srcDir, 'index.test.ts'), 'import { x } from "./index"')

  const srcLibDir = path.join(srcDir, 'lib')
  mkdirp.sync(srcLibDir)
  fs.writeFileSync(path.join(srcLibDir, 'util.ts'), 'export const y = () => console.log("util")')
  fs.writeFileSync(path.join(srcLibDir, 'util.test.ts'), 'import { y } from "./util"')

  const distDir = path.join(pkg, 'dist')
  mkdirp.sync(distDir)
  fs.writeFileSync(path.join(distDir, 'index.d.ts'), 'export declare function x(): void')
  fs.writeFileSync(path.join(distDir, 'index.js'), 'exports.x = function () { console.log("index") }')
  fs.writeFileSync(path.join(distDir, 'index.test.d.ts'), '')
  fs.writeFileSync(path.join(distDir, 'index.test.js'), 'var x = require("./index").x')

  const distLibDir = path.join(distDir, 'lib')
  mkdirp.sync(distLibDir)
  fs.writeFileSync(path.join(distLibDir, 'util.d.ts'), 'export declare function y(): void')
  fs.writeFileSync(path.join(distLibDir, 'util.js'), 'exports.y = function () { console.log("util") }')
  fs.writeFileSync(path.join(distLibDir, 'util.test.d.ts'), '')
  fs.writeFileSync(path.join(distLibDir, 'util.test.js'), 'var y = require("./util").y')

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
