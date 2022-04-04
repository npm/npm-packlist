const t = require('tap')
const pkg = t.testdir({
  'package.json': JSON.stringify({
    bin: 'bin.js',
    main: 'main.js',
    browser: 'browser.js',
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

const packlist = require('../')
t.test('package with negated files', async t => {
  t.matchSnapshot(await packlist({ path: pkg }), 'async')
})
