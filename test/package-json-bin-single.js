'use strict'

const Arborist = require('@npmcli/arborist')
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

t.test('follows npm package ignoring rules', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist({ path: pkg, tree })
  t.same(files, [
    '__bin',
    'lib/elf.js',
    'package.json',
  ])
})
