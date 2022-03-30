'use strict'

const t = require('tap')
const packlist = require('../')

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
    bin: {
      bar: '__bin_bar',
      foo: '__bin_foo',
    },
    files: [
      'lib',
    ],
  }),
  __bin_foo: bin,
  __bin_bar: bin,
  lib: {
    'elf.js': elfJS,
  },
  dummy: 'ignore this',
})

t.test('follows npm package ignoring rules', async (t) => {
  const files = await packlist({ path: pkg })
  t.same(files, [
    '__bin_bar',
    '__bin_foo',
    'lib/elf.js',
    'package.json',
  ])
})
