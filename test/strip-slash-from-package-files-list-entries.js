'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

t.test('should strip / from package.json files array entry results', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      files: [
        // include without slash, then exclude with it
        'somedir',
        '!somedir/',

        // other way around
        'otherdir/',
        '!otherdir',

        // now including it that way
        '!incldir/',
        'incldir',

        // exclude without slash, then include with it
        '!dist',
        'dist/',
        '!dist/foo/*.src',
      ],
    }),
    otherdir: {
      donotinclude: '',
    },
    somedir: {
      donotinclude: '',
    },
    incldir: {
      yesinclude: '',
    },
    foo: '',
    dist: {
      foo: {
        'foo.src': '',
        'foo.result': '',
      },
      bar: '',
      baz: {
        boo: '',
        'boo.src': '',
      },
    },
  })

  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist({ path: pkg, tree })
  t.same(files, [
    'dist/bar',
    'dist/baz/boo',
    'incldir/yesinclude',
    'package.json',
    'dist/foo/foo.result',
    'dist/baz/boo.src',
  ])
})
