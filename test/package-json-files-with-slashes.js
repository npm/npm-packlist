// In v1, this would exclude the 'lib/two.js' file, because
// the .npmignore is deeper in the tree and thus had higher
// precedence.  In v2, because /lib/two.js is in the files
// list as a file path, it will be included no matter what.
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
    '/lib/one.js',
    '/lib/two.js',
    '/lib/tre.js',
    '/lib/for.js',
  ]
}))
mkdirp.sync(pkg + '/lib')
fs.writeFileSync(pkg + '/lib/one.js', 'one')
fs.writeFileSync(pkg + '/lib/two.js', 'two')
fs.writeFileSync(pkg + '/lib/tre.js', 'tre')
fs.writeFileSync(pkg + '/lib/for.js', 'for')
fs.writeFileSync(pkg + '/lib/.npmignore', 'two.js')
fs.writeFileSync(pkg + '/lib/.DS_Store', 'a store of ds')

const packlist = require('../')
t.test('package with negated files', async t => {
  t.matchSnapshot(packlist.sync({path: pkg}))
  await t.resolveMatchSnapshot(packlist({path: pkg}))
})

