'use strict'

const Arborist = require('@npmcli/arborist')
const { symlinkSync } = require('node:fs')
const { join } = require('node:path')
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
      files: ['elf.js'],
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

  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
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
      files: ['elf.js'],
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

  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    'elf.js',
    'node_modules/history/index.js',
    'node_modules/history/package.json',
    'package.json',
  ])
})

t.test('includes only declared bundles through a symlinked package root', async (t) => {
  const fixture = t.testdir({
    physical: {
      'package.json': JSON.stringify({
        name: 'test-package',
        version: '1.0.0',
        dependencies: { bundled: '1.0.0', unbundled: '1.0.0' },
        bundleDependencies: ['bundled'],
      }),
      node_modules: {
        bundled: {
          'package.json': JSON.stringify({ name: 'bundled', version: '1.0.0' }),
        },
        unbundled: {
          'package.json': JSON.stringify({ name: 'unbundled', version: '1.0.0' }),
        },
      },
    },
  })
  const alias = join(fixture, 'alias')
  symlinkSync(join(fixture, 'physical'), alias, 'junction')

  const tree = await new Arborist({ path: alias }).loadActual()
  t.same(await packlist(tree, { path: alias }), [
    'node_modules/bundled/package.json',
    'package.json',
  ])
})
