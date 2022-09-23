'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    name: 'test-package',
    version: '1.2.3',
  }),
  'package-lock.json': JSON.stringify({
    lock: true,
    include: false,
  }),
  'yarn.lock': JSON.stringify({
    lock: 'file',
    include: false,
  }),
  lib: {
    core: 'no longer excluded dump file',
    'package-lock.json': JSON.stringify({
      lock: 'file',
      include: true,
    }),
    'yarn.lock': JSON.stringify({
      lock: 'file',
      include: true,
    }),
  },
  core: {
    'include-me.txt': 'please include me',
  },
})

t.test('follows npm package ignoring rules', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    'lib/core',
    'lib/package-lock.json',
    'package.json',
    'lib/yarn.lock',
    'core/include-me.txt',
  ])
})
