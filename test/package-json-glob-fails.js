const {resolve, basename} = require('path')
const pkg = resolve(__dirname, basename(__filename, '.js'))
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const t = require('tap')
rimraf.sync(pkg)
mkdirp.sync(pkg)
t.teardown(() => rimraf.sync(pkg))

const fs = require('fs')
fs.writeFileSync(pkg + '/package.json', JSON.stringify({
  files: [
    'lib',
    '!lib/one',
  ]
}))
mkdirp.sync(pkg + '/lib')
fs.writeFileSync(pkg + '/lib/one', 'one')
fs.writeFileSync(pkg + '/lib/two', 'two')
fs.writeFileSync(pkg + '/lib/tre', 'tre')
fs.writeFileSync(pkg + '/lib/for', 'for')
fs.writeFileSync(pkg + '/lib/.npmignore', 'two')
fs.writeFileSync(pkg + '/lib/.DS_Store', 'a store of ds')

const requireInject = require('require-inject')
const glob = (pattern, opt, cb) => cb(new Error('no glob for you'))
glob.sync = (pattern, opt) => { throw new Error('no glob for you') }
const packlist = requireInject('../', { glob })

t.test('package with busted glob', async t => {
  await t.rejects(packlist({path: pkg}), { message: 'no glob for you' })
  t.throws(() => packlist.sync({path: pkg}), { message: 'no glob for you' })
})
