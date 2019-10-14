'use strict'
const t = require('tap')

const pack = require('../')

const elfJS = `
module.exports = elf =>
  console.log("i'm a elf")
`

const pkg = t.testdir({
  'package.json': JSON.stringify({
    'name': 'test-package',
    'version': '3.1.4',
    'main': 'elf.js',
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
  'this': {
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
    '.git': 'do not include me'
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
