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
  bin: 'bin.js',
  main: 'main.js',
  browser: 'browser.js',
  bundleDependencies: [
    'foo',
    '@foo/bar'
  ]
}))
mkdirp.sync(pkg + '/lib')
mkdirp.sync(pkg + '/node_modules/foo')
mkdirp.sync(pkg + '/node_modules/@foo/bar')
mkdirp.sync(pkg + '/inc')

// bundle dep files are ALWAYS included
fs.writeFileSync(pkg + '/node_modules/foo/package-lock.json', 'include')
// even questionable things
fs.writeFileSync(pkg + '/node_modules/@foo/bar/.DS_Store', 'not this tho')

// these get included
fs.writeFileSync(pkg + '/bin.js', 'bin')
fs.writeFileSync(pkg + '/main.js', 'main')
fs.writeFileSync(pkg + '/browser.js', 'browser')
fs.writeFileSync(pkg + '/npm-shrinkwrap.json', 'sw')
fs.writeFileSync(pkg + '/inc/package.json', JSON.stringify({
  files: []
}))
fs.writeFileSync(pkg + '/inc/foo', 'include me plz')
fs.writeFileSync(pkg + '/inc/package-lock.json', 'include me plz')

// these do not
fs.writeFileSync(pkg + '/.npmignore', 'lib/*')
fs.writeFileSync(pkg + '/package-lock.json', 'sw')
fs.writeFileSync(pkg + '/lib/package-lock.json', 'sw')
fs.writeFileSync(pkg + '/lib/package.json.js', '{}')
fs.writeFileSync(pkg + '/lib/bin.js', 'bin')
fs.writeFileSync(pkg + '/lib/main.js', 'main')
fs.writeFileSync(pkg + '/lib/browser.js', 'browser')
fs.writeFileSync(pkg + '/lib/npm-shrinkwrap.json', 'sw')

const packlist = require('../')
t.test('package with negated files', async t => {
  t.matchSnapshot(packlist.sync({path: pkg}))
  await t.resolveMatchSnapshot(packlist({path: pkg}))
})
