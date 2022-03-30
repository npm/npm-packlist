'use strict'
const t = require('tap')
const pack = require('../')
const bin = `
#!/usr/bin/env node
require("../lib/elf")()
`
const elfJS = `
module.exports = elf =>
  console.log("i'm angry about elves")
`
const pkg = t.testdir({
  'package.json': JSON.stringify({
    name: 'test-package',
    version: '1.6.2',
    bin: '__bin',
    files: [
      'lib',
    ],
  }),
  __bin: bin,
  lib: {
    'elf.js': elfJS,
  },
  dummy: 'ignore',
})

t.test('follows npm package ignoring rules', t => {
  const check = (files, t) => {
    t.matchSnapshot(files)
    t.end()
  }

  t.test('async', t => pack({ path: pkg }).then(files => check(files, t)))

  t.end()
})
