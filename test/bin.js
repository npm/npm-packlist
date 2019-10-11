const {spawn} = require('child_process')
const bin = require.resolve('../bin/index.js')
const run = (...args) => new Promise(res => {
  const out = []
  const err = []
  const c = spawn(process.execPath, [bin, ...args], { cwd: me })
  c.stdout.on('data', c => out.push(c))
  c.stderr.on('data', c => err.push(c))
  c.on('close', (code, signal) => res({
    code,
    signal,
    stdout: Buffer.concat(out).toString('utf8'),
    stderr: Buffer.concat(err).toString('utf8'),
  }))
})
const t = require('tap')
const {resolve, basename} = require('path')
const me = resolve(__dirname, basename(__filename, '.js'))
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
rimraf.sync(me)
mkdirp.sync(me)
t.teardown(() => rimraf.sync(me))

const fs = require('fs')
fs.writeFileSync(me + '/package.json', JSON.stringify({
  files: ['index.js', 'lib']
}))
fs.writeFileSync(me + '/README.md', 'hello')
fs.writeFileSync(me + '/LICENSE.txt', 'you can use it but you gotta pay me')
fs.writeFileSync(me + '/index.js', 'console.log(/xss/)')
mkdirp.sync(me + '/lib')
fs.writeFileSync(me + '/lib/index.js', 'console.log(/xss/)')
fs.writeFileSync(me + '/ignore.js', 'throw new Error("dont look at me!")')

t.test('no args', t => t.resolveMatchSnapshot(run()))
t.test('--sort', t => t.resolveMatchSnapshot(run('--sort')))
t.test('-s', t => t.resolveMatchSnapshot(run('-s')))
t.test('dir argument', t => t.resolveMatchSnapshot(run('.')))
t.test('-h', t => t.resolveMatchSnapshot(run('-h')))
