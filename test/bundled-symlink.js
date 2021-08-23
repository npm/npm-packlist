'use strict'

const t = require('tap')

const pack = require('../')

const elfJS = `
module.exports = elf =>
  console.log("i'm a elf")
`

const pkg = t.testdir({
  pkg: {
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
      history: t.fixture('symlink', '../../history'),
    },
  },
  history: {
    'package.json': JSON.stringify({
      name: 'history',
      version: '1.0.0',
      main: 'index.js',
      files: [
        'index.js',
        'lib/',
      ],
    }),
    'index.js': elfJS,
    tests: {
      'test.js': 'please do not include me',
    },
    // this should not be followed, even though the bundled dep is
    lib: {
      linky: t.fixture('symlink', '../tests'),
    },
  },
}) + '/pkg'

t.test('includes bundled dependency', function (t) {
  const check = (files, t) => {
    t.matchSnapshot(files)
    t.end()
  }

  t.test('sync', t => check(pack.sync({ path: pkg }), t))
  t.test('async', t => pack({ path: pkg }).then(files => check(files, t)))

  t.end()
})
