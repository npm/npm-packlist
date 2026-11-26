// The paths that "files" globs expand to are turned into a few set-based rules (one per group
// of consecutive same-sign entries) instead of one minimatch rule per matched path, which made
// packing time quadratic in the number of matched files. Matched paths are also matched
// literally, so file names containing glob characters are no longer misread as patterns.
'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('../')

const walk = async (pkg, Walker = packlist.Walker) => {
  const tree = await new Arborist({ path: pkg }).loadActual()
  const walker = new Walker(tree, { path: pkg, isPackage: true })
  const files = await new Promise((resolve, reject) => {
    walker.on('done', resolve).on('error', reject).start()
  })
  return { files: [...files].sort(), rules: walker.ignoreRules['package.json'], walker }
}

t.test('file names with glob characters are packed when matched by a glob', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({ files: ['dist/**/*.js'] }),
    dist: {
      '[id].js': '',
      '[...slug].js': '',
      'a{b,c}.js': '',
      '(group).js': '',
      'plain.js': '',
      'plain.js.map': '',
    },
  })

  const files = await packlist(await new Arborist({ path: pkg }).loadActual())
  t.same(files.sort(), [
    'dist/(group).js',
    'dist/[...slug].js',
    'dist/[id].js',
    'dist/a{b,c}.js',
    'dist/plain.js',
    'package.json',
  ].sort())
})

t.test('a matched file name with glob characters does not pull in other files', async (t) => {
  const pkg = t.testdir({
    // the escaped pattern selects `[id].js` only; `i.js` and `d.js` must stay out.
    // `a?b,c?.js` selects `a{b,c}.js` only; `ab.js` and `ac.js` must stay out.
    'package.json': JSON.stringify({ files: ['dist/[[]id].js', 'dist/a?b,c?.js'] }),
    dist: {
      '[id].js': '',
      'i.js': '',
      'd.js': '',
      'a{b,c}.js': '',
      'ab.js': '',
      'ac.js': '',
    },
  })

  const files = await packlist(await new Arborist({ path: pkg }).loadActual())
  t.same(files.sort(), ['dist/[id].js', 'dist/a{b,c}.js', 'package.json'].sort())
})

t.test('many matched files produce one rule per group of consecutive same-sign entries', async (t) => {
  const mods = {}
  const expected = []
  for (let m = 0; m < 20; m++) {
    const sub = {}
    for (let f = 0; f < 10; f++) {
      sub[`f${f}.js`] = ''
      sub[`f${f}.js.map`] = ''
      sub[`f${f}.d.ts`] = ''
      if (m !== 3) {
        expected.push(`build/mod${m}/sub/f${f}.js`)
      }
    }
    expected.push(`build/mod${m}/sub/f0.d.ts`)
    mods[`mod${m}`] = { sub }
  }
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      files: [
        'build/**/*.js',
        'build/*/sub/f0.d.ts',
        '!build/mod3/**',
        '!build/mod4/sub/missing.js',
        'build/mod3/sub/f0.d.ts',
      ],
    }),
    build: mods,
  })
  expected.push('package.json')

  const { files, rules } = await walk(pkg)
  t.same(files, expected.sort(), 'packs the matched files')
  t.same(rules.map(r => r.negate), [false, true, false, true],
    'one `*` rule, then one rule per group of consecutive same-sign entries')
})

t.test('set rules match like the minimatch rules they replace', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({ files: ['lib/a/b.js', 'Docs', 'top.js'] }),
    lib: { a: { 'b.js': '', 'c.js': '' } },
    Docs: { 'x.md': '' },
    'top.js': '',
  })

  const { rules, walker } = await walk(pkg)
  t.equal(rules.length, 2)
  const rule = rules[1]
  t.equal(rule.negate, true)
  t.notOk(rule.globParts.some(part => part.length <= (part.slice(-1)[0] ? 1 : 2)),
    'is never treated as a relative rule by ignore-walk')

  // the rules the set rule stands in for, compiled by ignore-walk itself so that they follow
  // any change in how it compiles rules
  const oracleRules = Symbol('oracle')
  walker.injectRules(oracleRules, ['!/lib/a/b.js', '!/Docs', '!/Docs/**', '!/top.js'])
  const oracle = walker.ignoreRules[oracleRules]
  // every form ignore-walk calls match() with: `/entry` and `entry`, with and without
  // `partial`, then `/entry/` and `entry/`
  const entries = [
    'lib', 'LIB', 'lib/a', 'LIB/A', 'lib/a/b.js', 'lib/a/B.JS', 'lib/a/c.js', 'lib/a/b.js/x',
    'lib/a/b', 'docs', 'Docs', 'Docs/x.md', 'Docs/deep/er/x', 'Docsx', 'top.js', 'top', 'x/top.js',
  ]
  const calls = entries.flatMap(e => [
    [`/${e}`, false], [e, false], [`/${e}`, true], [e, true], [`/${e}/`, false], [`${e}/`, false],
  ])
  for (const [path, partial] of calls) {
    t.equal(rule.match(path, partial), oracle.some(m => m.match(path, partial)),
      `match(${JSON.stringify(path)}, ${partial})`)
  }
})

t.test('patch files with glob characters in their name are excluded', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      files: ['lib', 'patches/*.patch'],
      patchedDependencies: { 'dep@1.0.0': 'patches/dep@1.0.0[fix].patch' },
    }),
    lib: { 'index.js': '' },
    patches: { 'dep@1.0.0[fix].patch': '' },
  })

  const files = await packlist(await new Arborist({ path: pkg }).loadActual())
  t.same(files.sort(), ['lib/index.js', 'package.json'].sort())
})

t.test('main, browser and bin with glob characters survive a negated "files" entry', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      files: ['dist', '!dist/**/*.js', 'scripts', '!scripts/**/*.mjs'],
      main: 'dist/[id].js',
      browser: 'dist/{a,b}.js',
      bin: { tool: 'scripts/(cli)/[tool].mjs' },
    }),
    dist: {
      '[id].js': '',
      '{a,b}.js': '',
      'i.js': '',
      'a.js': '',
      'other.js': '',
      'keep.txt': '',
    },
    scripts: { '(cli)': { '[tool].mjs': '', 't.mjs': '' } },
  })

  const files = await packlist(await new Arborist({ path: pkg }).loadActual())
  t.same(files.sort(), [
    'dist/[id].js',
    'dist/keep.txt',
    'dist/{a,b}.js',
    'package.json',
    'scripts/(cli)/[tool].mjs',
  ].sort())
})

t.test('backslashes in matched names are kept on POSIX', {
  skip: process.platform === 'win32' && 'backslash is a path separator on Windows',
}, async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({ files: ['dist/**/*.js'] }),
    dist: {
      'index.js': '',
      'win\\out': { 'x.js': '' },
      'a\\b.js': '',
    },
  })

  const files = await packlist(await new Arborist({ path: pkg }).loadActual())
  t.same(files.sort(), ['dist/a\\b.js', 'dist/index.js', 'dist/win\\out/x.js', 'package.json'].sort())
})

t.test('entries that match nothing do not split the groups around them', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      files: ['dist/a/*.js', '!dist/**/*.test.js', 'dist/b/*.js', '!missing', 'lib', '!nope/**'],
    }),
    dist: { a: { 'x.js': '' }, b: { 'y.js': '' } },
    lib: { 'z.js': '' },
  })

  const { files, rules } = await walk(pkg)
  t.same(files, ['dist/a/x.js', 'dist/b/y.js', 'lib/z.js', 'package.json'])
  t.same(rules.map(r => r.negate), [false, true], 'one `*` rule, then a single group')
})

// PathSetRule stands in for a Minimatch in ignore-walk's rule lists, which only works as long as
// ignore-walk reads nothing but `negate`, `globParts` and `match` from a rule. Fail on any
// other read, so that an ignore-walk update relying on more of the Minimatch API is noticed.
t.test('ignore-walk only reads the members a set rule provides', async (t) => {
  const allowed = new Set(['negate', 'globParts', 'match'])
  const reads = new Set()
  const unexpected = new Set()
  const guard = (rule) => new Proxy(rule, {
    get (target, key) {
      reads.add(key)
      if (!allowed.has(key)) {
        unexpected.add(String(key))
      }
      const value = target[key]
      return typeof value === 'function' ? value.bind(target) : value
    },
  })

  class GuardedWalker extends packlist.Walker {
    filterEntries () {
      const rules = this.ignoreRules['package.json']
      if (rules && !rules.guarded) {
        rules.forEach((rule, i) => {
          if (rule.constructor.name === 'PathSetRule') {
            rules[i] = guard(rule)
          }
        })
        rules.guarded = true
      }
      return super.filterEntries()
    }
  }

  const pkg = t.testdir({
    'package.json': JSON.stringify({ files: ['lib/a/b.js', 'Docs', '!Docs/secret.md', 'top.js'] }),
    lib: { a: { 'b.js': '', 'c.js': '' }, 'd.js': '' },
    Docs: { 'x.md': '', 'secret.md': '', deep: { 'y.md': '' } },
    other: { 'z.js': '' },
    'top.js': '',
  })

  const { files } = await walk(pkg, GuardedWalker)
  t.same(files, ['Docs/deep/y.md', 'Docs/x.md', 'lib/a/b.js', 'package.json', 'top.js'])
  t.same([...reads].sort(), [...allowed].sort(), 'the set rules were consulted')
  t.same([...unexpected], [], 'no other member was read')
})
