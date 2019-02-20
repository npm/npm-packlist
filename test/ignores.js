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
  'package.json',
  'elf.js',
  'readme.md',
  'deps/foo/config/config.gypi'
]

t.test('setup', t => {
  rimraf.sync(pkg)
  mkdirp.sync(pkg)
  fs.writeFileSync(
    path.join(pkg, 'package.json'),
    JSON.stringify(json, null, 2)
  )

  const archPkgs = path.join(pkg, 'archived-packages')
  mkdirp.sync(archPkgs)
  fs.writeFileSync(
    path.join(archPkgs, 'ignoreme'),
    'this should be ignored'
  )

  fs.writeFileSync(
    path.join(pkg, 'elf.js'),
    elfJS
  )

  fs.writeFileSync(
    path.join(pkg, '.npmrc'),
    'packaged=false'
  )

  // the '!**/non.existent' rule is important as it tests if the default rules
  // block .git contents even if it's accidentally 'unlocked'.
  // see https://npm.community/t/1805
  fs.writeFileSync(
    path.join(pkg, '.npmignore'),
    '.npmignore\ndummy\npackage.json\n!**/non.existent\nreadme.md\n*~'
  )

  fs.writeFileSync(
    path.join(pkg, 'dummy'),
    'foo'
  )

  fs.writeFileSync(
    path.join(pkg, 'core'),
    'foo'
  )

  fs.mkdirSync(
    path.join(pkg, '.DS_Store')
  )
  fs.writeFileSync(
    path.join(pkg, '.DS_Store', 'foo'),
    'foo'
  )

  fs.writeFileSync(
    path.join(pkg, 'readme.md'),
    'Elf package readme included even if ignored'
  )

  fs.writeFileSync(
    path.join(pkg, 'readme.md~'),
    'Editor backup file should not be auto-included'
  )

  // empty dir should be ignored
  mkdirp.sync(pkg + '/this/dir/is/empty/and/ignored')

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

  const gitFile = path.join(pkg, 'deps/.git')
  fs.writeFileSync(gitFile, 'do not include me\n')

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
