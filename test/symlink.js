'use strict'

const Arborist = require('@npmcli/arborist')
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
  'link.js': t.fixture('symlink', 'elf.js'),
  '.npmrc': 'packaged=false',
  '.npmignore': '.npmignore\ndummy\n/package.json\n',
  // empty dir should be ignored
  this: { dir: { is: { empty: { and: { ignored: {} } } } } },
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

  // ljharb's monorepo test goober that blew up
  test: { resolver: { multirepo: { packages: {
    a: {
      README: 'included',
      node_modules: {
        some_dep: {
          'package.json': JSON.stringify({ version: '1.2.3' }),
        },
        '@scope': {
          b: t.fixture('symlink', '../../../b'),
        },
      },
    },
    b: {
      'index.js': 'console.log("woop")',
      node_modules: {
        a: t.fixture('symlink', '../../a'),
      },
    },
  } } } },
})

t.test('follows npm package ignoring rules', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    'test/resolver/multirepo/packages/a/README',
    'deps/foo/config/config.gypi',
    'elf.js',
    'test/resolver/multirepo/packages/b/index.js',
    'package.json',
    'test/resolver/multirepo/packages/a/node_modules/some_dep/package.json',
  ])
})
