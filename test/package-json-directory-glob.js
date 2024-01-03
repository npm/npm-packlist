'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('..')

const createTestdir = (...files) => t.testdir({
  'package.json': JSON.stringify({
    files,
  }),
  folder: {
    one: { file: 'one' },
    two: { file: 'two' },
  },
  folder1: {
    one: { file: 'one' },
    two: { file: 'two' },
  },
})

t.test('package json directory glob', async (t) => {
  const pkgFiles = [
    'folder',
    'folder/',
    'folder/*',
    'folder/**',
    'folder/**/*',
    './folder/*',
  ]

  for (const files of pkgFiles) {
    await t.test(files, async t => {
      const pkg = createTestdir(files)
      const arborist = new Arborist({ path: pkg })
      const tree = await arborist.loadActual()
      const res = await packlist(tree)
      t.same(res, [
        'folder/one/file',
        'folder/two/file',
        'package.json',
      ])
    })
  }
})
