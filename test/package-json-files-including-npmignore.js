// In v11+, with pure glob semantics for `files[]`, listing `.npmignore` (or
// any other always-ignored file from the default ignore list) in `files[]`
// no longer forces it to be packed. The default-ignore rule wins, because
// `files[]` only un-ignores against the package.json deny-all and does not
// override the strict default ignores. Authors who legitimately want to
// publish a `.npmignore` file should rename it to something else.
'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: [
      'lib/sub/*.js',
      'lib/.npmignore',
    ],
  }),
  lib: {
    '.npmignore': 'two.js',
    sub: {
      'one.js': 'one',
      'two.js': 'two',
      'tre.js': 'tre',
      'for.js': 'for',
    },
    '.DS_Store': 'a store of ds',
  },
})

t.test('package with negated files', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  // lib/.npmignore is dropped (default-ignore wins); lib/sub/two.js is
  // dropped (lib/.npmignore excludes it). lib/.npmignore being unpacked
  // does not affect the application of its rules within the walk.
  t.same(files, [
    'lib/sub/for.js',
    'lib/sub/one.js',
    'lib/sub/tre.js',
    'package.json',
  ])
})
