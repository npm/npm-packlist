'use strict'

const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    name: 'test',
  }),
})

t.test('export supports callbacks', (t) => {
  packlist({ path: pkg }, (err, files) => {
    if (err) {
      throw err
    }

    t.same(files, [
      'package.json',
    ])
    t.end()
  })
})
