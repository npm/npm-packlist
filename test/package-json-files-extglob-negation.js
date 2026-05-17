'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('..')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: [
      'lib/(!test)',
    ],
  }),
  lib: {
    'main.js': 'main',
    'foo.js': 'foo',
    utils: {
      'foo-util.js': 'util',
    },
    test: {
      'main_test.js': 't',
    },
  },
})

t.test('package with lib/(!test) files pattern', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)

  const expected = [
    'lib/main.js',
    'lib/foo.js',
    'lib/utils/foo-util.js',
    'package.json',
  ]
  for (const e of expected) {
    t.ok(files.includes(e), `includes ${e}`)
  }
})
