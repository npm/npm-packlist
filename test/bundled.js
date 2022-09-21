'use strict'

const t = require('tap')
const packlist = require('../')

const elfJS = `
module.exports = elf =>
  console.log("i'm a elf")
`

t.test('includes bundled dependency using bundleDependencies', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'test-package',
      version: '3.1.4',
      main: 'elf.js',
      dependencies: {
        history: '1.0.0',
      },
      bundleDependencies: [
        'history',
      ],
    }),
    'elf.js': elfJS,
    '.npmrc': 'packaged=false',
    node_modules: {
      history: {
        'package.json': JSON.stringify({
          name: 'history',
          version: '1.0.0',
          main: 'index.js',
        }),
        'index.js': elfJS,
      },
    },
  })

  const files = await packlist({ path: pkg })
  t.same(files, [
    'elf.js',
    'node_modules/history/index.js',
    'node_modules/history/package.json',
    'package.json',
  ])
})

t.test('includes bundled dependency using bundledDependencies', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'test-package',
      version: '3.1.4',
      main: 'elf.js',
      dependencies: {
        history: '1.0.0',
      },
      bundledDependencies: [
        'history',
      ],
    }),
    'elf.js': elfJS,
    '.npmrc': 'packaged=false',
    node_modules: {
      history: {
        'package.json': JSON.stringify({
          name: 'history',
          version: '1.0.0',
          main: 'index.js',
        }),
        'index.js': elfJS,
      },
    },
  })

  const files = await packlist({ path: pkg })
  t.same(files, [
    'elf.js',
    'node_modules/history/index.js',
    'node_modules/history/package.json',
    'package.json',
  ])
})
