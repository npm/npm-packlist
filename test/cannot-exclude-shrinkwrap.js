// cannot exclude npm-shrinkwrap.json in the root
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
  files: ['.npmignore', '!npm-shrinkwrap.json']
}))
fs.writeFileSync(pkg + '/.npmignore', `
npm-shrinkwrap.json
`)
fs.writeFileSync(pkg + '/npm-shrinkwrap.json', '{}')

const packlist = require('../')
t.test('package with negated files', async t => {
  t.matchSnapshot(packlist.sync({path: pkg}))
  await t.resolveMatchSnapshot(packlist({path: pkg}))
})

