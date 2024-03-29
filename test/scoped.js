'use strict'

const Arborist = require('@npmcli/arborist')
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
    dependencies: {
      '@npmwombat/scoped': '1.0.0',
    },
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
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree, { bundled: ['@npmwombat/scoped'] })
  t.same(files, [
    'elf.js',
    'node_modules/@npmwombat/scoped/index.js',
    'package.json',
  ])
})
