const t = require('tap')
const Arborist = require('@npmcli/arborist')
const packlist = require('../')

t.test('ignores the complete Vim swap suffix sequence by default', async t => {
  const swaps = {}
  // Vim counts down from .swp to .saa, rolling .swa over to .svz.
  const suffix = ['s', 'w', 'p']
  for (;;) {
    swaps[`.package.json.${suffix.join('')}`] = 'editor buffer'
    if (suffix[1] === 'a' && suffix[2] === 'a') {
      break
    }
    if (suffix[2] === 'a') {
      suffix[1] = String.fromCharCode(suffix[1].charCodeAt(0) - 1)
      suffix[2] = 'z'
    } else {
      suffix[2] = String.fromCharCode(suffix[2].charCodeAt(0) - 1)
    }
  }
  t.equal(Object.keys(swaps).length, 588, 'covers every Vim swap suffix')

  const ordinary = {
    '.package.json.swq': 'beyond the swap sequence',
    '.package.json.sxz': 'beyond the swap sequence',
    '.package.json.SWQ': 'uppercase extension beyond the swap sequence',
    '.package.json.swo.js': 'longer extension',
    'package.json.swo': 'no leading dot',
    '.swo': 'no filename before the suffix',
    'index.js': 'module.exports = true',
  }
  const pkg = t.testdir({
    'package.json': JSON.stringify({ name: 'vim-swaps', version: '1.0.0' }),
    ...swaps,
    ...ordinary,
    '.buffer.SAA': 'ignore-walk matches defaults without regard to case',
    nested: { ...swaps, ...ordinary, '.buffer.SWO': 'uppercase swap suffix' },
  })
  const tree = await new Arborist({ path: pkg }).loadActual()
  const files = await packlist(tree)
  t.same(files.sort(), [
    'package.json',
    ...Object.keys(ordinary),
    ...Object.keys(ordinary).map(file => `nested/${file}`),
  ].sort(), 'excludes swap buffers at every depth without excluding nearby names')
})

t.test('explicit files entries can still include swap files', async t => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      files: ['.keep.swp', '.keep.swo', '.keep.saa'],
    }),
    '.keep.swp': 'first swap',
    '.keep.swo': 'second swap',
    '.keep.saa': 'last swap',
    '.other.swo': 'not explicitly included',
  })
  const tree = await new Arborist({ path: pkg }).loadActual()
  t.same((await packlist(tree)).sort(), [
    '.keep.swp', '.keep.swo', '.keep.saa', 'package.json',
  ].sort())
})

t.test('npmignore can still re-include swap files', async t => {
  const pkg = t.testdir({
    'package.json': '{}',
    '.npmignore': '!.keep.swp\n!.keep.swo\n',
    '.keep.swp': 'first swap',
    '.keep.swo': 'second swap',
    '.other.swo': 'not explicitly included',
    nested: {
      '.npmignore': '!.keep.swp\n!.keep.swo\n!.keep.saa\n',
      '.keep.swp': 'first swap',
      '.keep.swo': 'second swap',
      '.keep.saa': 'last swap',
      '.other.saa': 'not explicitly included',
    },
  })
  const tree = await new Arborist({ path: pkg }).loadActual()
  t.same((await packlist(tree)).sort(), [
    '.keep.swp', '.keep.swo', 'nested/.keep.swp', 'nested/.keep.swo',
    'nested/.keep.saa', 'package.json',
  ].sort())
})
