'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

t.test('include a globstar, then exclude one of them', async (t) => {
  const path = t.testdir({
    'foo.js': '',
    'bar.js': '',
    bar: {
      'bar.js': '',
    },
    'glorp.txt': '',
    'package.json': JSON.stringify({
      name: 'cli-issue-2009',
      version: '1.0.0',
      files: [
        '**/*.js',
        '!foo.js',
      ],
    }),
  })

  const arborist = new Arborist({ path })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    'bar.js',
    'bar/bar.js',
    'package.json',
  ])
})
