'use strict'
const t = require('tap')

const pack = require('../')

const elfJS = `
module.exports = elf =>
  console.log("i'm a elf")
`

const pkg = t.testdir({
  'package.json': JSON.stringify({
    name: 'test-package',
    version: '3.1.4',
    main: '__main.js',
    browser: 'browser.js',
    files: [
      'elf.js',
      'deps/foo/config/config.gypi',
    ],
  }),
  'elf.js': elfJS,
  '__main.js': elfJS,
  'browser.js': elfJS,
  '.npmrc': 'packaged=false',

  // don't bother even reading this file, because we have files list
  '.npmignore': '!.npmignore\n!dummy\npackage.json',
  dummy: 'foo',
  build: {
    'config.gypi': "i_wont_be_included='with any luck'",
    'npm-debug.log': '0 lol\n',
  },
  deps: {
    foo: {
      config: {
        'config.gypi': "i_will_be_included='with any luck'",
      },
    },
  },
  '.git': {
    gitstub: "won't fool git, also won't be included",
  },
  node_modules: {
    history: {
      'README.md': "please don't include me",
    },
  },
})

t.test('follows npm package ignoring rules', function (t) {
  const check = (files, t) => {
    t.matchSnapshot(files)
    t.end()
  }

  t.test('sync', t => check(pack.sync({ path: pkg }), t))
  t.test('async', t => pack({ path: pkg }).then(files => check(files, t)))

  t.end()
})
