// disabling the no-sparse-arrays rule because we use them for assertions
/* eslint-disable no-sparse-arrays */
'use strict'

const t = require('tap')
const { spawnSync } = require('child_process')

const nodePath = process.execPath
const binPath = require.resolve('./utils/bin.js')

const cwd = t.testdir({
  'package.json': JSON.stringify({
    files: ['index.js', 'lib'],
  }),
  'README.md': 'hello',
  'LICENSE.txt': 'you can use it but you gotta pay me',
  'index.js': 'console.log(/xss/)',
  lib: {
    'index.js': 'console.log(/xss/)',
    'cat.js': 'console.log("meow")',
    'dog.js': 'console.log("woof")',
    'chai.js': 'console.log("blub")',
  },
  'ignore.js': 'throw new Error("dont look at me!")',
})

t.test('no args', async (t) => {
  const result = spawnSync(nodePath, [binPath], { cwd, encoding: 'utf8' })
  t.equal(result.status, 0, 'completed successfully')
  t.same(result.stdout, [
    'lib/cat.js',
    'lib/chai.js',
    'lib/dog.js',
    'index.js',
    'lib/index.js',
    'package.json',
    'README.md',
    'LICENSE.txt',, // empty element at the end so we get a trailing \n
  ].join('\n'))
})

t.test('--sort', async (t) => {
  const result = spawnSync(nodePath, [binPath, '--sort'], { cwd, encoding: 'utf8' })
  t.equal(result.status, 0, 'completed successfully')
  t.same(result.stdout, [
    'index.js',
    'lib/cat.js',
    'lib/chai.js',
    'lib/dog.js',
    'lib/index.js',
    'LICENSE.txt',
    'package.json',
    'README.md',, // empty element at the end so we get a trailing \n
  ].join('\n'))
})

t.test('-s', async (t) => {
  const result = spawnSync(nodePath, [binPath, '-s'], { cwd, encoding: 'utf8' })
  t.equal(result.status, 0, 'completed successfully')
  t.same(result.stdout, [
    'index.js',
    'lib/cat.js',
    'lib/chai.js',
    'lib/dog.js',
    'lib/index.js',
    'LICENSE.txt',
    'package.json',
    'README.md',, // empty element at the end so we get a trailing \n
  ].join('\n'))
})

t.test('dir argument', async (t) => {
  const result = spawnSync(nodePath, [binPath, '.'], { cwd, encoding: 'utf8' })
  t.equal(result.status, 0, 'completed successfully')
  t.same(result.stdout, [
    '> .', // the directory name prefixed with "> "
    '  lib/cat.js', // the files will all be indented
    '  lib/chai.js',
    '  lib/dog.js',
    '  index.js',
    '  lib/index.js',
    '  package.json',
    '  README.md',
    '  LICENSE.txt',, // empty element at the end so we get a trailing \n
  ].join('\n'))
})

t.test('-h', async (t) => {
  const result = spawnSync(nodePath, [binPath, '-h'], { cwd, encoding: 'utf8' })
  t.equal(result.status, 0, 'completed successfully')
  t.match(result.stdout, /^usage: npm-packlist/, 'printed help')
})
