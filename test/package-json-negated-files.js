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

const packlist = require('../')
t.test('package with negated files', async t => {
  t.matchSnapshot(packlist.sync({path: pkg}))
  await t.resolveMatchSnapshot(packlist({path: pkg}))
})
