const mutateFS = require('mutate-fs')
const {resolve, basename} = require('path')
const pkg = resolve(__dirname, basename(__filename, '.js'))
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const t = require('tap')
rimraf.sync(pkg)
mkdirp.sync(pkg)
t.teardown(() => rimraf.sync(pkg))

const fs = require('fs')
fs.writeFileSync(pkg + '/package.json', 'no json here')
fs.writeFileSync(pkg + '/index.js')

const packlist = require('../')
t.test('read fails on package.json', async t => {
  const poop = new Error('poop')
  t.teardown(mutateFS.fail('readFile', poop))

  t.rejects(packlist({ path: pkg }), poop)
  t.throws(() => packlist.sync({ path: pkg }), poop)
})
