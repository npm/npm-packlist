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
      '!copying',
    ],

  }),
  'readme.md': 'one',
  licence: 'two',
  license: 'tre',
  copying: 'for',
  lib: {
    'readme.md': 'one',
    licence: 'two',
    license: 'tre',
    copying: 'for',
    a: {
      'readme.md': 'one',
      licence: 'two',
      license: 'tre',
      copying: 'for',
      b: {
        'readme.md': 'one',
        licence: 'two',
        license: 'tre',
        copying: 'for',
        c: {
          'readme.md': 'one',
          licence: 'two',
          license: 'tre',
          copying: 'for',
          'file.txt': 'one',
          'c.js': 'two',
        },
        'file.txt': 'one',
        'b.js': 'two',
      },
      'file.txt': 'one',
      'a.js': 'two',
    },
  } })

t.test('package with negated readme, licence and license files', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    'copying',
    'licence',
    'license',
    'lib/a/a.js',
    'lib/a/b/b.js',
    'lib/a/b/c/c.js',
    'package.json',
    'readme.md',
  ])
})
