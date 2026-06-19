// root .npm-extension.{mjs,cjs} are npm install policy, never package contents
'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: ['lib', '.npm-extension.mjs', '.npm-extension.cjs'],
  }),
  '.npm-extension.mjs': 'export function transformManifest (p) { return p }\n',
  '.npm-extension.cjs': 'module.exports = { transformManifest (p) { return p } }\n',
  lib: { 'index.js': '' },
})

t.test('try to include .npm-extension files but cannot', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    'lib/index.js',
    'package.json',
  ], 'both .npm-extension files are excluded even when listed in files')
})
