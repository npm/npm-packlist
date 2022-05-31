'use strict'

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
  // this simulates what it looks like when a user does i.e. npm pack -w ./workspaces/foo
  const files = await packlist({
    path: workspacePath,
    prefix: root,
    workspaces: [workspacePath],
  })
  t.same(files, [
    'child.js',
    'package.json',
  ])

  // here we leave off workspaces to satisfy coverage
  const secondFiles = await packlist({
    path: workspacePath,
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
  // this simulates what it looks like when a user does i.e. npm pack from a workspace root
  const files = await packlist({
    path: root,
    prefix: root,
    workspaces: [workspacePath],
  })
  t.same(files, [
    'root.js',
    'package.json',
  ])

  const secondFiles = await packlist({
    path: root,
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
  const files = await packlist({
    path: workspacePath,
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
  const secondFiles = await packlist({
    path: workspacePath,
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
