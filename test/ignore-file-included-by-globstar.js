'use strict'

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

  const files = await packlist({ path })
  t.same(files, [
    'bar.js',
    'bar/bar.js',
    'package.json',
  ])
})
