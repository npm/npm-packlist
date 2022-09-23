// cannot exclude npm-shrinkwrap.json in the root
'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: ['.npmignore', '!npm-shrinkwrap.json'],
  }),
  '.npmignore': 'npm-shrinkwrap.json',
  'npm-shrinkwrap.json': '{}',
})

t.test('package with negated files', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    '.npmignore',
    'npm-shrinkwrap.json',
    'package.json',
  ])
})
