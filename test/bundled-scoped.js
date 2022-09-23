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
    name: 'test-package',
    version: '3.1.4',
    main: 'elf.js',
    dependencies: {
      '@npmwombat/history': '1.0.0',
    },
    bundleDependencies: [
      '@npmwombat/history',
    ],
  }),
  'elf.js': elfJS,
  '.npmrc': 'packaged=false',
  node_modules: {
    '@npmwombat': {
      history: {
        'package.json': JSON.stringify({
          name: '@npmwombat/history',
          version: '1.0.0',
          main: 'index.js',
        }),
        'index.js': elfJS,
      },
    },
  },
})

t.test('includes bundled dependency', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist({ path: pkg, tree })
  t.same(files, [
    'elf.js',
    'node_modules/@npmwombat/history/index.js',
    'node_modules/@npmwombat/history/package.json',
    'package.json',
  ])
})
