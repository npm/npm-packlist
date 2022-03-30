const mutateFS = require('mutate-fs')
const t = require('tap')
const pkg = t.testdir({
  'package.json': 'no json here',
  'index.js': '',
})

const packlist = require('../')
t.test('read fails on package.json', async t => {
  const poop = new Error('poop')
  t.teardown(mutateFS.fail('readFile', poop))

  await t.rejects(packlist({ path: pkg }), poop)
})
