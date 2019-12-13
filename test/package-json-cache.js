const t = require('tap')
const path = require('path')

const elfJS = `
module.exports = elf =>
  console.log("i'm a elf")
`

const pkg = t.testdir({
  'package.json': JSON.stringify({
    name: 'test-package',
    version: '3.1.4',
    files: [
      'quendi.js'
    ]
  }),
  'elf.js': elfJS,
  'quendi.js': elfJS,
})

const rootManifestPath = path.resolve(pkg, 'package.json')

const packlist = require('../')

t.test('seeded with root manifest', async t => {
  const packageJsonCache = new Map().set(rootManifestPath, {
    files: [
      'elf.js'
    ]
  })
  t.matchSnapshot(packlist.sync({ path: pkg, packageJsonCache }))
  await t.resolveMatchSnapshot(packlist({ path: pkg, packageJsonCache }))
})

t.test('seeded with invalid JSON falls back to filesystem', t => {
  t.matchSnapshot(packlist.sync({
    path: pkg,
    packageJsonCache: new Map().set(rootManifestPath, "c'est ne pas une j'son")
  }))
  t.done()
})

t.test('when empty', t => {
  t.matchSnapshot(packlist.sync({ path: pkg, packageJsonCache: new Map() }))
  t.done()
})
