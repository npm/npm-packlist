'use strict'

const t = require('tap')

// mock glob so it throws an error
const glob = (pattern, opt, cb) => cb(new Error('no glob for you'))
const packlist = t.mock('../', { glob })

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: [
      'lib',
      '!lib/one',
    ],
  }),
  lib: {
    one: 'one',
    two: 'two',
    tre: 'tre',
    for: 'for',
    '.npmignore': 'two',
    '.DS_Store': 'a store of ds',
  },
})

t.test('package with busted glob', async (t) => {
  await t.rejects(packlist({ path: pkg }), { message: 'no glob for you' })
})
