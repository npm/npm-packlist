'use strict'
const fs = require('fs')

const readdir = fs.readdir
fs.readdir = (path, cb) => {
  readdir(path, (er, entries) => {
    if (er) {
      cb(er)
    } else {
      cb(null, entries.concat('made*of*stars'))
    }
  })
}

const readdirSync = fs.readdirSync
fs.readdirSync = path => readdirSync(path).concat('made*of*stars')

const elfJS = `
module.exports = elf =>
  console.log("i'm a elf")
`

const t = require('tap')
const pack = require('../')
const expect = [
  'deps/foo/config/config.gypi',
  'elf.js',
  'package.json',
]
const pkg = t.testdir({
  'package.json': JSON.stringify({
    name: 'test-package',
    version: '3.1.4',
    main: 'elf.js',
  }),
  'elf.js': elfJS,
  '.npmrc': 'packaged=false',
  '.npmignore': '.npmignore\ndummy\npackage.json',
  dummy: 'foo',

  // empty dir should be ignored
  this: { dir: { is: { empty: { and: { ignored: {} } } } } },
  build: {
    'config.gypi': "i_wont_be_included='with any luck'",
    'npm-debug.log': '0 lol\n',
  },
  deps: {
    foo: {
      config: {
        'config.gypi': "i_will_be_included='with any luck'",
      },
    },
  },
  '.git': {
    gitstub: "won't fool git, also won't be included",
  },
  node_modules: {
    history: {
      'README.md': "please don't include me",
    },
  },
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
