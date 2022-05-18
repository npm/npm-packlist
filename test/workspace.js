'use strict'

const path = require('path')
const t = require('tap')

const packlist = require('../')

t.test('respects workspace root ignore files', async (t) => {
  const root = t.testdir({
    'package.json': JSON.stringify({
      name: 'workspace-root',
      version: '1.0.0',
      main: 'index.js',
      workspaces: ['./workspaces/foo'],
    }),
    'index.js': `console.log('hello')`,
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
          main: 'index.js',
        }),
        'index.js': `console.log('hello')`,
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
    'index.js',
    'package.json',
  ])
})
