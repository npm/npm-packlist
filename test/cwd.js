'use strict'

const t = require('tap')
const packlist = require('../')

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
  '.npmignore': '.npmignore\ndummy\npackage.json\n',
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

t.test('follows npm package ignoring rules', async (t) => {
  const cwd = process.cwd()
  t.teardown(() => process.chdir(cwd))
  process.chdir(pkg)

  const files = await packlist()
  t.same(files, [
    'deps/foo/config/config.gypi',
    'elf.js',
    'package.json',
  ])
})
