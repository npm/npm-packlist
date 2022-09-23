// cannot exclude package.json in the root
'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: ['.npmignore', '!package.json'],
  }),
  '.npmignore': 'package.json',
})

t.test('try to exclude package.json but cannot', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist({ path: pkg, tree })
  t.same(files, [
    '.npmignore',
    'package.json',
  ])
})
