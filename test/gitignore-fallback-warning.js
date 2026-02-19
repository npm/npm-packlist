'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

t.test('warns when root has only .gitignore and no .npmignore', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'test-package',
      version: '1.0.0',
    }),
    '.gitignore': 'secret.txt',
    'index.js': 'module.exports = {}',
    'secret.txt': 'do not publish',
  })

  const warnings = []
  const onLog = (level, ...args) => {
    if (level === 'warn') {
      warnings.push(args)
    }
  }
  process.on('log', onLog)
  t.teardown(() => process.removeListener('log', onLog))

  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  await packlist(tree)

  t.equal(warnings.length, 1, 'should emit exactly one warning')
  t.equal(warnings[0][0], 'gitignore-fallback')
})

t.test('does not warn when root has .npmignore and subdir has .gitignore', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'test-package',
      version: '1.0.0',
    }),
    '.npmignore': 'secret.txt',
    'index.js': 'module.exports = {}',
    subdir: {
      '.gitignore': '*.log',
      'lib.js': 'module.exports = {}',
      'debug.log': 'debug output',
    },
  })

  const warnings = []
  const onLog = (level, ...args) => {
    if (level === 'warn') {
      warnings.push(args)
    }
  }
  process.on('log', onLog)
  t.teardown(() => process.removeListener('log', onLog))

  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  await packlist(tree)

  t.equal(warnings.length, 0, 'should not emit any warning')
})

t.test('does not warn when package.json has files field', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'test-package',
      version: '1.0.0',
      files: ['index.js'],
    }),
    '.gitignore': 'secret.txt',
    'index.js': 'module.exports = {}',
    'secret.txt': 'do not publish',
  })

  const warnings = []
  const onLog = (level, ...args) => {
    if (level === 'warn') {
      warnings.push(args)
    }
  }
  process.on('log', onLog)
  t.teardown(() => process.removeListener('log', onLog))

  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  await packlist(tree)

  t.equal(warnings.length, 0, 'should not emit any warning when files field is used')
})
