// ensure we don't get files more than one time, even if specified
// in ways that will have them included from multiple directions
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
    '/lib/*.js',
    'lib/*.js',
    '/lib/one.js',
    'lib/one.js',
    'lib/one.*',
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

