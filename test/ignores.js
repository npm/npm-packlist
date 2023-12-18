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
  'archived-packages': {
    ignoreme: 'this should be ignored',
  },
  'elf.js': elfJS,
  '.npmrc': 'packaged=false',
  // the '!**/non.existent' rule is important as it tests if the default rules
  // block .git contents even if it's accidentally 'unlocked'.
  // see https://npm.community/t/1805
  '.npmignore': `
.npmignore
dummy
package.json
!**/non.existent
readme.md
*~
`,
  dummy: 'foo',
  core: 'foo',
  '.DS_Store': {
    foo: 'foo',
  },
  'readme.md': 'Elf package readme included even if ignored',
  'readme.md~': 'Editor backup file should not be auto-included',
  this: {
    dir: {
      is: {
        empty: {
          and: {
            ignored: {},
          },
        },
      },
    },
  },
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
    '.git': 'do not include me',
  },
  '.git': {
    gitstub: 'wont fool git, also wont be included',
    logs: {
      refs: {
        remotes: {
          name: {
            readme: 'please donot include git dirs (or even walk them)',
          },
        },
      },
    },
  },
  packages: {
    pkg1: {
      dist: {
        'file1.md': 'new file',
      },
      '.npmignore': 'test*\n*.gz',
      'package.json': JSON.stringify({
        name: 'pkg1',
        version: '1.0.0',
        main: 'index.js',
      }),
    },
  },
  node_modules: {
    history: {
      'README.md': "please don't include me",
    },
  },
})

t.test('follows npm package ignoring rules', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    'core',
    'deps/foo/config/config.gypi',
    'elf.js',
    'package.json',
    'packages/pkg1/dist/file1.md',
    'readme.md',
  ])
})

t.test('follows gitignore and npmignore rules', async (t) => {
  const arborist = new Arborist({ path: pkg + '/packages/pkg1' })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.match(files, [
    'package.json',
    'dist/file1.md',
  ])
})
