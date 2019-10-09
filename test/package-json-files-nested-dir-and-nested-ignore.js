// Show that a nested .npmignore will be skipped over if the
// 'files' array matches a dir that passes by it.
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
    'lib/dir',
  ]
}))
mkdirp.sync(pkg + '/lib/dir')
fs.writeFileSync(pkg + '/lib/dir/one.js', 'one')
fs.writeFileSync(pkg + '/lib/dir/two.js', 'two')
fs.writeFileSync(pkg + '/lib/dir/tre.js', 'tre')
fs.writeFileSync(pkg + '/lib/dir/for.js', 'for')
fs.writeFileSync(pkg + '/lib/.npmignore', 'dir/two.js')
fs.writeFileSync(pkg + '/lib/.DS_Store', 'a store of ds')

const packlist = require('../')
t.test('package with negated files', async t => {
  t.matchSnapshot(packlist.sync({path: pkg}))
  await t.resolveMatchSnapshot(packlist({path: pkg}))
})

