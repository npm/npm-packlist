'use strict'
const t = require('tap')

const pack = require('../')

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

t.test('follows npm package ignoring rules', function (t) {
  const check = (files, t) => {
    t.matchSnapshot(files)
    t.end()
  }

  t.test('async', t => pack({ path: pkg }).then(files => check(files, t)))

  t.end()
})
