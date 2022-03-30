'use strict'

const t = require('tap')

const pack = require('../')

const elfJS = `
module.exports = elf =>
  console.log("i'm a elf")
`

t.test('includes bundled dependency using bundleDependencies', function (t) {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'test-package',
      version: '3.1.4',
      main: 'elf.js',
      bundleDependencies: [
        'history',
      ],
    }),
    'elf.js': elfJS,
    '.npmrc': 'packaged=false',
    node_modules: {
      history: {
        'package.json': JSON.stringify({
          name: '@npmwombat/history',
          version: '1.0.0',
          main: 'index.js',
        }),
        'index.js': elfJS,
      },
    },
  })

  const check = (files, t) => {
    t.matchSnapshot(files)
    t.end()
  }

  t.test('async', t => pack({ path: pkg }).then(files => check(files, t)))

  t.end()
})

t.test('includes bundled dependency using bundledDependencies', function (t) {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'test-package',
      version: '3.1.4',
      main: 'elf.js',
      bundledDependencies: [
        'history',
      ],
    }),
    'elf.js': elfJS,
    '.npmrc': 'packaged=false',
    node_modules: {
      history: {
        'package.json': JSON.stringify({
          name: '@npmwombat/history',
          version: '1.0.0',
          main: 'index.js',
        }),
        'index.js': elfJS,
      },
    },
  })

  const check = (files, t) => {
    t.matchSnapshot(files)
    t.end()
  }

  t.test('async', t => pack({ path: pkg }).then(files => check(files, t)))

  t.end()
})
