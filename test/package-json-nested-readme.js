// include readme.* files anywhere in a package
const {resolve, basename} = require('path')
const pkg = resolve(__dirname, basename(__filename, '.js'))
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const t = require('tap')
rimraf.sync(pkg)
mkdirp.sync(pkg)
t.teardown(() => rimraf.sync(pkg))

const fs = require('fs')
fs.writeFileSync(pkg + '/package.json', JSON.stringify({}))
mkdirp.sync(pkg + '/lib/a/b/c')
mkdirp.sync(pkg + '/test/a/b/c')
fs.writeFileSync(pkg + '/.npmignore', `
!*.js
!**/*.js
test
`)
fs.writeFileSync(pkg + '/lib/a/b/c/readme.md', 'one')
fs.writeFileSync(pkg + '/lib/a/b/c/file.txt', 'one')
fs.writeFileSync(pkg + '/lib/a/b/c/c.js', 'one')
fs.writeFileSync(pkg + '/lib/a/b/readme.md', 'one')
fs.writeFileSync(pkg + '/lib/a/b/file.txt', 'one')
fs.writeFileSync(pkg + '/lib/a/b/b.js', 'one')
fs.writeFileSync(pkg + '/lib/a/readme.md', 'one')
fs.writeFileSync(pkg + '/lib/a/file.txt', 'one')
fs.writeFileSync(pkg + '/lib/a/a.js', 'one')
fs.writeFileSync(pkg + '/test/a/b/c/readme.md', 'one')
fs.writeFileSync(pkg + '/test/a/b/c/file.txt', 'one')
fs.writeFileSync(pkg + '/test/a/b/c/c.js', 'one')
fs.writeFileSync(pkg + '/test/a/b/readme.md', 'one')
fs.writeFileSync(pkg + '/test/a/b/file.txt', 'one')
fs.writeFileSync(pkg + '/test/a/b/b.js', 'one')
fs.writeFileSync(pkg + '/test/a/readme.md', 'one')
fs.writeFileSync(pkg + '/test/a/file.txt', 'one')
fs.writeFileSync(pkg + '/test/a/a.js', 'one')

const packlist = require('../')
t.test('package with negated files', async t => {
  t.matchSnapshot(packlist.sync({path: pkg}))
  await t.resolveMatchSnapshot(packlist({path: pkg}))
})

