// Files whose names contain glob magic characters (route files like
// `[slug].js`, `{a,b}.js`, `+(a).js`) must still be packed when a `files`
// entry matches them. The matched paths are turned into ignore rules, so they
// have to be escaped or ignore-walk reads them as patterns again.
'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: [
      'dist/**/*.js',
      'app/*',
      '!dist/skip/**',
    ],
  }),
  dist: {
    'index.js': 'index',
    blog: {
      '[slug].js': 'slug',
      '[...all].js': 'all',
      '{a,b}.js': 'braces',
      '+(a).js': 'extglob',
    },
    skip: {
      '[id].js': 'skipped',
    },
  },
  app: {
    '[locale]': {
      'page.js': 'page',
    },
  },
})

t.test('files with glob magic in their names', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files.sort(), [
    'app/[locale]/page.js',
    'dist/blog/+(a).js',
    'dist/blog/[...all].js',
    'dist/blog/[slug].js',
    'dist/blog/{a,b}.js',
    'dist/index.js',
    'package.json',
  ])
})
