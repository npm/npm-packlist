'use strict'

const Arborist = require('@npmcli/arborist')
const path = require('path')
const t = require('tap')

const packlist = require('../')

t.test('respects workspace root ignore files', async (t) => {
  const root = t.testdir({
    'package.json': JSON.stringify({
      name: 'workspace-root',
      version: '1.0.0',
      main: 'root.js',
      workspaces: ['./workspaces/foo'],
    }),
    'root.js': `console.log('hello')`,
    '.gitignore': 'ignore-me',
    'ignore-me': 'should be ignored',
    workspaces: {
      '.gitignore': 'ignore-me-also',
      'ignore-me': 'should be ignored',
      'ignore-me-also': 'should also be ignored',
      foo: {
        'package.json': JSON.stringify({
          name: 'workspace-child',
          version: '1.0.0',
          main: 'child.js',
        }),
        'child.js': `console.log('hello')`,
        'ignore-me': 'should be ignored',
        'ignore-me-also': 'should also be ignored',
      },
    },
  })

  const workspacePath = path.join(root, 'workspaces', 'foo')
  const arborist = new Arborist({ path: workspacePath })
  const tree = await arborist.loadActual()
  // this simulates what it looks like when a user does i.e. npm pack -w ./workspaces/foo
  const files = await packlist(tree, {
    prefix: root,
    workspaces: [workspacePath],
  })
  t.same(files, [
    'child.js',
    'package.json',
  ])

  // leave off workspaces to prove that when prefix and root differ there is no change
  // in behavior without also specifying workspaces
  const secondFiles = await packlist(tree, {
    prefix: root,
  })
  t.same(secondFiles, [
    'ignore-me',
    'ignore-me-also',
    'child.js',
    'package.json',
  ])
})

t.test('packing a workspace root does not include children', async (t) => {
  const root = t.testdir({
    'package.json': JSON.stringify({
      name: 'workspace-root',
      version: '1.0.0',
      main: 'root.js',
      workspaces: ['./workspaces/foo'],
    }),
    'root.js': `console.log('hello')`,
    '.gitignore': 'ignore-me',
    'ignore-me': 'should be ignored',
    workspaces: {
      '.gitignore': 'ignore-me-also',
      'ignore-me': 'should be ignored',
      'ignore-me-also': 'should also be ignored',
      foo: {
        'package.json': JSON.stringify({
          name: 'workspace-child',
          version: '1.0.0',
          main: 'child.js',
        }),
        'child.js': `console.log('hello')`,
        'ignore-me': 'should be ignored',
        'ignore-me-also': 'should also be ignored',
      },
    },
  })

  const workspacePath = path.join(root, 'workspaces', 'foo')
  // this simulates what it looks like when a user does `npm pack` from a workspace root
  const arborist = new Arborist({ path: root })
  const tree = await arborist.loadActual()
  const files = await packlist(tree, {
    prefix: root,
    workspaces: [workspacePath],
  })
  t.same(files, [
    'root.js',
    'package.json',
  ])

  // prove if we leave off workspaces we do not omit them
  const secondFiles = await packlist(tree, {
    prefix: root,
  })
  t.same(secondFiles, [
    'workspaces/foo/child.js',
    'root.js',
    'package.json',
    'workspaces/foo/package.json',
  ])
})

t.test('.gitignore is discarded if .npmignore exists outside of tree', async (t) => {
  const root = t.testdir({
    'package.json': JSON.stringify({
      name: 'workspace-root',
      version: '1.0.0',
      main: 'root.js',
      workspaces: ['./workspaces/foo'],
    }),
    'root.js': `console.log('hello')`,
    '.gitignore': 'dont-ignore-me',
    '.npmignore': 'only-ignore-me',
    'dont-ignore-me': 'should not be ignored',
    'only-ignore-me': 'should be ignored',
    workspaces: {
      '.gitignore': 'dont-ignore-me-either',
      '.npmignore': 'ignore-me-also',
      'dont-ignore-me': 'should not be ignored',
      'dont-ignore-me-either': 'should not be ignored',
      'only-ignore-me': 'should be ignored',
      'ignore-me-also': 'should be ignored',
      foo: {
        'package.json': JSON.stringify({
          name: 'workspace-child',
          version: '1.0.0',
          main: 'child.js',
        }),
        'child.js': `console.log('hello')`,
        'dont-ignore-me': 'should not be ignored',
        'dont-ignore-me-either': 'should not be ignored',
        'only-ignore-me': 'should be ignored',
        'ignore-me-also': 'should also be ignored',
      },
    },
  })

  const workspacePath = path.join(root, 'workspaces', 'foo')
  // this simulates what it looks like when a user does i.e. npm pack -w ./workspaces/foo
  const arborist = new Arborist({ path: workspacePath })
  const tree = await arborist.loadActual()
  const files = await packlist(tree, {
    prefix: root,
    workspaces: [workspacePath],
  })
  t.same(files, [
    'dont-ignore-me',
    'dont-ignore-me-either',
    'child.js',
    'package.json',
  ])

  // here we leave off workspaces to satisfy coverage
  const secondFiles = await packlist(tree, {
    prefix: root,
  })
  t.same(secondFiles, [
    'dont-ignore-me',
    'dont-ignore-me-either',
    'ignore-me-also',
    'only-ignore-me',
    'child.js',
    'package.json',
  ])
})

t.test('workspace npmignore overrides inherited gitignore rules', async t => {
  for (const npmignore of ['', 'local-secret\n']) {
    for (const inheritedNpmignore of [false, true]) {
      await t.test(JSON.stringify({ npmignore, inheritedNpmignore }), async t => {
        const root = t.testdir({
          'package.json': JSON.stringify({
            name: 'workspace-root',
            version: '1.0.0',
            workspaces: ['packages/*'],
          }),
          '.gitignore': 'dist\n',
          ...(inheritedNpmignore ? { '.npmignore': 'root-secret\n' } : {}),
          packages: {
            '.gitignore': 'intermediate-secret\n',
            pkg: {
              'package.json': JSON.stringify({ name: 'workspace-child', version: '1.0.0' }),
              '.npmignore': npmignore,
              '.gitignore': 'dist\n',
              '.npmrc': 'always excluded',
              'root-secret': 'still follows inherited npmignore',
              'local-secret': 'follows workspace npmignore',
              'intermediate-secret': 'not excluded by inherited gitignore',
              dist: { 'index.js': 'module.exports = 42' },
              nested: {
                '.gitignore': 'nested-secret\n',
                'nested-secret': 'still follows nested gitignore',
                'index.js': 'module.exports = 1',
              },
            },
          },
        })
        const workspacePath = path.join(root, 'packages', 'pkg')
        const tree = await new Arborist({ path: workspacePath }).loadActual()
        const files = await packlist(tree, { prefix: root, workspaces: [workspacePath] })
        t.ok(files.includes('dist/index.js'), 'includes built output ignored by parent gitignore')
        t.ok(files.includes('intermediate-secret'), 'ignores intermediate gitignore')
        t.equal(files.includes('root-secret'), !inheritedNpmignore, 'retains inherited npmignore')
        t.equal(files.includes('local-secret'), !npmignore, 'honors workspace npmignore')
        t.ok(files.includes('nested/index.js'), 'includes unrelated nested output')
        t.notOk(files.includes('nested/nested-secret'), 'honors nested gitignore')
        t.notOk(files.includes('.npmrc'), 'preserves mandatory exclusions')
      })
    }
  }
})
