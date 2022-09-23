'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    name: 'test',
  }),
})

t.test('export supports callbacks', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()

  return new Promise((resolve, reject) => {
    packlist(tree, (err, files) => {
      if (err) {
        reject(err)
      }

      t.same(files, [
        'package.json',
      ])
      resolve(files)
    })
  })
})
