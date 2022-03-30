'use strict'

const t = require('tap')
const fs = require('fs')

// the fs.readdir call takes place in ignore-walk, not npm-packlist, so we t.mock
// ignore-walk first to clear its require cache and pick up the mocked fs
const ignoreWalk = t.mock('ignore-walk', {
  fs: {
    ...fs,
    readdir: (path, callback) => {
      fs.readdir(path, (err, entries) => {
        if (err) {
          return callback(err)
        }

        return callback(null, entries.concat('made*of*stars'))
      })
    },
  },
})

// then we t.mock npm-packlist itself so that we can pick up the mocked ignore-walk
const packlist = t.mock('../', {
  'ignore-walk': ignoreWalk,
})

const elfJS = `
module.exports = elf =>
  console.log("i'm a elf")
`

const pkg = t.testdir({
  'package.json': JSON.stringify({
    name: 'test-package',
    version: '3.1.4',
    main: 'elf.js',
  }),
  'elf.js': elfJS,
  '.npmrc': 'packaged=false',
  '.npmignore': '.npmignore\ndummy\npackage.json',
  dummy: 'foo',

  // empty dir should be ignored
  this: { dir: { is: { empty: { and: { ignored: {} } } } } },
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

t.test('follows npm package ignoring rules', async (t) => {
  const files = await packlist({ path: pkg })
  t.same(files, [
    'deps/foo/config/config.gypi',
    'elf.js',
    'package.json',
  ])
})
