// cannot exclude readme.md in the root
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
  files: ['.npmignore', '!readme.md']
}))
fs.writeFileSync(pkg + '/.npmignore', `
readme.md
`)
fs.writeFileSync(pkg + '/readme.md', 'hello')

const packlist = require('../')
t.test('try to exclude package.json but cannot', async t => {
  console.error(packlist.sync({path: pkg}))
  t.matchSnapshot(packlist.sync({path: pkg}))
  await t.resolveMatchSnapshot(packlist({path: pkg}))
})
