const t = require('tap')
const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: [
      'lib',
      '!lib/one',
    ]
  }),
  lib: {
    'one': 'one',
    'two': 'two',
    'tre': 'tre',
    'for': 'for',
    '.npmignore': 'two',
    '.DS_Store': 'a store of ds',
  },
})

const requireInject = require('require-inject')
const glob = (pattern, opt, cb) => cb(new Error('no glob for you'))
glob.sync = (pattern, opt) => { throw new Error('no glob for you') }
const packlist = requireInject('../', { glob })

t.test('package with busted glob', async t => {
  await t.rejects(packlist({path: pkg}), { message: 'no glob for you' })
  t.throws(() => packlist.sync({path: pkg}), { message: 'no glob for you' })
})
