'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

t.test('correctly bundles cyclic deps', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'root',
      version: '1.0.0',
      main: 'index.js',
      dependencies: {
        a: '1.0.0',
      },
      bundleDependencies: ['a'],
    }),
    'index.js': '',
    node_modules: {
      a: {
        'package.json': JSON.stringify({
          name: 'a',
          version: '1.0.0',
          main: 'index.js',
          dependencies: {
            b: '1.0.0',
          },
        }),
        'index.js': '',
      },
      b: {
        'package.json': JSON.stringify({
          name: 'b',
          version: '1.0.0',
          main: 'index.js',
          dependencies: {
            a: '1.0.0',
          },
        }),
        'index.js': '',
      },
    },
  })

  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist({ path: pkg, tree })
  t.same(files, [
    'index.js',
    'node_modules/a/index.js',
    'node_modules/b/index.js',
    'node_modules/a/package.json',
    'node_modules/b/package.json',
    'package.json',
  ])
})
