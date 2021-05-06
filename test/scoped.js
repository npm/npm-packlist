const pack = require('../')
const t = require('tap')
const elfJS = `
module.exports = elf =>
  console.log("i'm a elf")
`

const pkg = t.testdir({
  'package.json': JSON.stringify({
    name: 'test-package-scoped',
    version: '3.1.4',
    main: 'elf.js',
    bundledDependencies: [
      '@npmwombat/scoped',
    ],
  }),
  'elf.js': elfJS,
  node_modules: {
    '@npmwombat': {
      scoped: {
        'index.js': "console.log('hello wombat')",
      },
      no: {
        'wombat.js': "console.log('no bundle please')",
      },
    },
    '@ignore': {
      scoped: {
        'index.js': "console.log('i do not want to be bundled')",
      },
    },
  },
})

t.test('includes bundledDependencies', function (t) {
  const check = (files, t) => {
    t.matchSnapshot(files)
    t.end()
  }

  const bundled = ['@npmwombat/scoped']
  const options = {
    path: pkg,
    bundled: bundled,
  }

  t.test('sync', t => check(pack.sync(options), t))
  t.test('async', t => pack(options).then(files => check(files, t)))

  t.end()
})
