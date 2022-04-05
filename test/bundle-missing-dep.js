'use strict'

const t = require('tap')
const packlist = require('../')

t.test('skips bundling deps with missing edges', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'test',
      version: '1.0.0',
      main: 'index.js',
      // named in bundleDependencies, but not actually a dependency
      bundleDependencies: ['history'],
    }),
    'index.js': '',
    node_modules: {
      history: {
        'package.json': JSON.stringify({
          name: 'history',
          version: '1.0.0',
          main: 'index.js',
        }),
        'index.js': '',
      },
    },
  })

  const files = await packlist({ path: pkg })
  t.same(files, [
    'index.js',
    'package.json',
  ])
})
