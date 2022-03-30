'use strict'

const t = require('tap')
const path = require('path')
const packlist = require('../')

const elfJS = `
module.exports = elf =>
  console.log("i'm a elf")
`

const pkg = t.testdir({
  'package.json': JSON.stringify({
    name: 'test-package',
    version: '3.1.4',
    files: [
      'quendi.js',
    ],
  }),
  'elf.js': elfJS,
  'quendi.js': elfJS,
})

const rootManifestPath = path.resolve(pkg, 'package.json')

t.test('seeded with root manifest', async (t) => {
  const packageJsonCache = new Map()
  packageJsonCache.set(rootManifestPath, {
    files: [
      'elf.js',
    ],
  })

  const files = await packlist({ path: pkg, packageJsonCache })
  t.same(files, [
    'elf.js',
    'package.json',
  ])
})

t.test('seeded with invalid JSON falls back to filesystem', async (t) => {
  const packageJsonCache = new Map()
  packageJsonCache.set(rootManifestPath, "c'est ne pas une j'son")

  const files = await packlist({ path: pkg, packageJsonCache })
  t.same(files, [
    'quendi.js',
    'package.json',
  ])
})

t.test('when empty', async t => {
  const packageJsonCache = new Map()

  const files = await packlist({ path: pkg, packageJsonCache })
  t.same(files, [
    'quendi.js',
    'package.json',
  ])
})

t.test('when not provided at all', async t => {
  // can't use the exported function to provide no cache, have to create a Walker instance
  const walker = new packlist.Walker({ path: pkg })

  const files = await new Promise((resolve, reject) => {
    walker
      .on('done', resolve)
      .on('error', reject)
      .start()
  })

  t.same(files, [
    'quendi.js',
    'package.json',
  ])
})
