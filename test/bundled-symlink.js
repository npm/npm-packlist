'use strict'

const t = require('tap')
const packlist = require('../')

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

t.test('includes bundled dependency', async (t) => {
  const files = await packlist({ path: pkg })
  t.same(files, [
    'elf.js',
    'node_modules/history/index.js',
    'node_modules/history/package.json',
    'package.json',
  ])
})
