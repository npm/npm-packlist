'use strict'

const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    bin: 'bin.js',
    main: 'main.js',
    browser: 'browser.js',
    dependencies: {
      foo: '1.0.0',
      '@foo/bar': '1.0.0',
    },
    bundleDependencies: [
      'foo',
      '@foo/bar',
    ],
  }),
  node_modules: {
    // bundle dep files are ALWAYS included
    // even questionable things
    foo: {
      'package-lock.json': 'include',
    },
    '@foo': {
      bar: {
        '.DS_Store': 'not this tho',
      },
    },
  },
  lib: {
    // these are not included
    'package-lock.json': 'sw',
    'package.json.js': '{}',
    'bin.js': 'bin',
    'main.js': 'main',
    'browser.js': 'browser',
    'npm-shrinkwrap.json': 'sw',
  },

  // these get included
  'bin.js': 'bin',
  'main.js': 'main',
  'browser.js': 'browser',
  'npm-shrinkwrap.json': 'sw',
  inc: {
    'package.json': JSON.stringify({ files: [] }),
    'package-lock.json': 'include me plz',
    foo: 'include me plz',
  },

  // these do not
  '.npmignore': 'lib/*',
  'package-lock.json': 'sw',
})

t.test('package with negated files', async (t) => {
  const files = await packlist({ path: pkg })
  t.same(files, [
    'node_modules/@foo/bar/.DS_Store',
    'inc/foo',
    'bin.js',
    'browser.js',
    'main.js',
    'npm-shrinkwrap.json',
    'inc/package-lock.json',
    'node_modules/foo/package-lock.json',
    'inc/package.json',
    'package.json',
  ])
})
