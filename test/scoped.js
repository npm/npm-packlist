'use strict'

const t = require('tap')
const packlist = require('../')

const elfJS = `
module.exports = elf =>
  console.log("i'm a elf")
`

const pkg = t.testdir({
  'package.json': JSON.stringify({
    name: 'test-package-scoped',
    version: '3.1.4',
    main: 'elf.js',
    bundledDependencies: [
      '@npmwombat/scoped',
    ],
  }),
  'elf.js': elfJS,
  node_modules: {
    '@npmwombat': {
      scoped: {
        'index.js': "console.log('hello wombat')",
      },
      no: {
        'wombat.js': "console.log('no bundle please')",
      },
    },
    '@ignore': {
      scoped: {
        'index.js': "console.log('i do not want to be bundled')",
      },
    },
  },
})

t.test('includes bundledDependencies', async (t) => {
  const files = await packlist({ path: pkg, bundled: ['@npmwombat/scoped'] })
  t.same(files, [
    'elf.js',
    'node_modules/@npmwombat/scoped/index.js',
    'package.json',
  ])
})
