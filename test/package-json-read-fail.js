'use strict'

const t = require('tap')
const fs = require('fs')

const pkg = t.testdir({
  'package.json': 'no json here',
  'index.js': '',
})

// mock fs.readFile to fail reading package.json
const packlist = t.mock('../', {
  fs: {
    ...fs,
    readFile: (path, options, callback) => {
      // this is _not_ an os specific path
      if (path === `${pkg}/package.json`) {
        if (typeof options === 'function') {
          callback = options
          options = undefined
        }
        return callback(new Error('readFile failed'))
      }
      return fs.readFile(path, options, callback)
    },
  },
})

t.test('read fails on package.json', async (t) => {
  await t.rejects(packlist({ path: pkg }), { message: 'readFile failed' })
})
