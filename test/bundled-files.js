'use strict'

const t = require('tap')

const elfJS = `
module.exports = elf =>
  console.log("i'm a elf")
`
const pkg = t.testdir({
  'package.json': JSON.stringify({
    name: 'test-package',
    version: '3.1.4',
    bundleDependencies: [
      'quendi',
    ],
    files: [
      'eldar.js',
    ],
  }),
  'eldar.js': elfJS,
  'avari.js': elfJS,
  node_modules: {
    quendi: {
      'package.json': JSON.stringify({
        name: 'quendi',
        version: '1.0.0',
      }),
      'index.js': elfJS,
    },
  }
})

const packlist = require('../')

t.test('bundles dependencies with explicit files', async t => {
  t.matchSnapshot(packlist.sync({path: pkg}))
  await t.resolveMatchSnapshot(packlist({path: pkg}))
})
