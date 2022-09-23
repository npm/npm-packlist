'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

t.test('packs workspace dependencies correctly', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'root',
      version: '1.2.3',
      main: 'index.js',
      files: ['index.js'],
      dependencies: {
        foo: '1.0.0',
        bar: '1.0.0',
      },
      bundleDependencies: ['foo', 'bar'],
      workspaces: ['./workspaces/*'],
    }),
    'index.js': '',
    workspaces: {
      foo: {
        'package.json': JSON.stringify({
          name: 'foo',
          version: '1.0.0',
          main: 'index.js',
        }),
        'index.js': '',
      },
      bar: {
        'package.json': JSON.stringify({
          name: 'bar',
          version: '1.0.0',
          main: 'index.js',
        }),
        'index.js': '',
      },
    },
    node_modules: {
      foo: t.fixture('symlink', '../workspaces/foo'),
      bar: t.fixture('symlink', '../workspaces/bar'),
    },
  })

  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist({ path: pkg, tree })
  t.same(files, [
    'index.js',
    'node_modules/bar/index.js',
    'node_modules/foo/index.js',
    'node_modules/bar/package.json',
    'node_modules/foo/package.json',
    'package.json',
  ])
})
