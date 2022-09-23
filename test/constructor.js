'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    name: 'test',
  }),
})

t.test('Walker constructor allows ommitting options entirely', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const walker = new packlist.Walker(tree)
  const files = await new Promise((resolve, reject) => {
    walker
      .on('done', resolve)
      .on('error', reject)
      .start()
  })
  t.same(files, [
    'package.json',
  ])
})
