// A wildcard `files` entry like `["**/*"]` expands (with `dot: true`) to include normally-default-ignored paths such as `.git/HEAD`, `.npmrc`, and `node_modules/...`.
// The strict default ignores must still win — none of those paths should be packed.
// This locks in the BREAKING CHANGE that listing a default-ignored file in `files[]` no longer forces it to be packed.
'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

const pkg = t.testdir({
  'package.json': JSON.stringify({
    files: ['**/*'],
  }),
  '.git': {
    HEAD: 'ref: refs/heads/main\n',
    config: '[core]\n',
  },
  '.npmrc': 'always-auth=true\n',
  node_modules: {
    foo: {
      'package.json': JSON.stringify({ name: 'foo', version: '1.0.0' }),
      'index.js': 'module.exports = "foo"\n',
    },
  },
  src: {
    'index.js': 'module.exports = "src"\n',
    '.hidden.js': 'module.exports = "hidden"\n',
  },
  'README.md': '# wildcard files test\n',
})

t.test('wildcard files[] does not override strict default ignores', async (t) => {
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    'src/.hidden.js',
    'src/index.js',
    'package.json',
    'README.md',
  ], 'strict defaults (.git, .npmrc, node_modules) win over wildcard files[]')
})
