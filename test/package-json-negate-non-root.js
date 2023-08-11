// exclude readme, license, and licnce files if package.json
// files array includes !readme, !license, or !licence
'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: [
      '**/*.js',
      '!readme.md',
      '!licence',
      '!license',
    ],

  }),
  'readme.md': 'one',
  licence: 'two',
  license: 'tre',
  lib: {
    'readme.md': 'one',
    licence: 'two',
    license: 'tre',
    a: {
      'readme.md': 'one',
      licence: 'two',
      license: 'tre',
      b: {
        'readme.md': 'one',
        licence: 'one',
        license: 'one',
        c: {
          'readme.md': 'one',
          licence: 'one',
          license: 'one',
          'file.txt': 'one',
          'c.js': 'one',
        },
        'file.txt': 'one',
        'b.js': 'one',
      },
      'file.txt': 'one',
      'a.js': 'one',
    },
  } })

t.test('package with negated readme, licence and license files', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    'licence',
    'license',
    'lib/a/a.js',
    'lib/a/b/b.js',
    'lib/a/b/c/c.js',
    'package.json',
    'readme.md',
  ])
})
