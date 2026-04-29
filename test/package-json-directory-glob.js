'use strict'

const Arborist = require('@npmcli/arborist')
const t = require('tap')
const packlist = require('..')

const createTestdir = (...files) => t.testdir({
  'package.json': JSON.stringify({
    files,
  }),
  folder: {
    one: { file: 'one' },
    two: { file: 'two' },
  },
  folder1: {
    one: { file: 'one' },
    two: { file: 'two' },
  },
})

t.test('package json directory entry expands to its full contents', async (t) => {
  // these patterns each resolve to the entire `folder/` subtree:
  //   - `folder` and `folder/` are literal directory paths
  //   - `./folder/` is the same after leading-./ normalization
  //   - `folder/**` and `folder/**/*` are explicit globstars
  // note that `folder/*` is intentionally not in this list any more --
  // under real glob semantics it now matches only direct children, see the
  // following subtest for that behavior.
  const pkgFiles = [
    'folder',
    'folder/',
    './folder/',
    'folder/**',
    'folder/**/*',
  ]

  for (const files of pkgFiles) {
    await t.test(files, async t => {
      const pkg = createTestdir(files)
      const arborist = new Arborist({ path: pkg })
      const tree = await arborist.loadActual()
      const res = await packlist(tree)
      t.same(res, [
        'folder/one/file',
        'folder/two/file',
        'package.json',
      ])
    })
  }
})

t.test('folder/* matches direct children, expanding subdirectory matches', async t => {
  // Under real glob semantics `folder/*` matches every direct child of
  // `folder/`. Each matched subdirectory is then expanded to include its
  // contents (the documented `files[]` directory-expansion behavior), so the
  // resulting file list is the same as if the user had written `folder/**`.
  // This convergence makes the loss of the historic `foo/* -> foo/**` rewrite
  // invisible in practice: identical output for any tree where every leaf
  // file is reachable through a depth-1 entry, which is always true on a
  // normal filesystem.
  const pkg = createTestdir('folder/*')
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const res = await packlist(tree)
  t.same(res, [
    'folder/one/file',
    'folder/two/file',
    'package.json',
  ])
})

t.test('folder/* with mixed depth-1 entries (file + subdir)', async t => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      files: ['dist/*'],
    }),
    dist: {
      'top.js': 'top',
      sub: {
        'deep.js': 'deep',
      },
    },
  })
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const res = await packlist(tree)
  // dist/top.js is a depth-1 file match;
  // dist/sub/ is a depth-1 directory match, expanded to its contents.
  t.same(res.sort(), [
    'dist/sub/deep.js',
    'dist/top.js',
    'package.json',
  ].sort())
})

t.test('dist-* (cli#7514) includes contents of matched directories', async t => {
  // regression for https://github.com/npm/cli/issues/7514: in npm-packlist v10,
  // `files: ["dist-*"]` matched the directory entries dist-cjs/ and dist-es/ but
  // failed to include their contents, leaving only `dist-other.js` packed.
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'cli-7514',
      version: '1.0.0',
      files: ['dist-*'],
    }),
    'dist-cjs': { 'index.js': 'cjs' },
    'dist-es': { 'index.js': 'es' },
    'dist-other.js': 'other',
  })
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const res = await packlist(tree)
  t.same(res.sort(), [
    'dist-cjs/index.js',
    'dist-es/index.js',
    'dist-other.js',
    'package.json',
  ].sort())
})

t.test('lib/ + !lib/test/ (npm-packlist#152) excludes a nested directory', async t => {
  // documented workaround for the buggy `lib/(!test)` form. with real glob
  // semantics this is the canonical way to publish lib/ minus its test dir.
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'pl-152',
      version: '1.0.0',
      files: ['lib/', '!lib/test/'],
    }),
    lib: {
      'main.js': 'main',
      'foo.js': 'foo',
      utils: { 'foo-util.js': 'util' },
      test: {
        'main_test.js': 'mt',
        'foo_test.js': 'ft',
        utils: { 'foo-util_test.js': 'ut' },
      },
    },
  })
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const res = await packlist(tree)
  t.same(res.sort(), [
    'lib/foo.js',
    'lib/main.js',
    'lib/utils/foo-util.js',
    'package.json',
  ].sort())
})

t.test('an entry that normalizes to empty (e.g. "./" or "/") is dropped', async t => {
  // before npm-packlist v11 this would lstat the package root and include
  // everything; under real glob semantics there is no such entry to glob, so
  // the user just gets the strict-default required files (package.json).
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'empty-entry',
      version: '1.0.0',
      files: ['./', '/', 'a.js'],
    }),
    'a.js': '',
    'b.js': '',
  })
  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const res = await packlist(tree)
  t.same(res.sort(), [
    'a.js',
    'package.json',
  ].sort())
})
