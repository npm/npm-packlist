'use strict'

const fs = require('fs')
const t = require('tap')
const { join } = require('path')

t.test('cannot include something that exists but is neither a file nor a directory', async (t) => {
  const pkg = t.testdir({
    'package.json': JSON.stringify({
      name: 'root',
      version: '1.0.0',
      main: 'index.js',
      files: ['lib', 'device'],
    }),
    'index.js': '',
    lib: {
      socket: '',
    },
    device: '',
  })

  // mock fs.lstat for ignore-walk so it tells us that lib/socket is not a file, dir, or symlink
  const ignoreWalk = t.mock('ignore-walk', {
    fs: {
      ...fs,
      lstat: (path, options, callback) => {
        if (typeof options === 'function') {
          callback = options
          options = undefined
        }
        if (path === join(pkg, 'lib', 'socket').replace(/\\/g, '/')) {
          return callback(null, {
            isFile: () => false,
            isDirectory: () => false,
            isSymbolicLink: () => false,
          })
        }
        return fs.lstat(path, options, callback)
      },
    },
  })

  const packlist = t.mock('../', {
    'ignore-walk': ignoreWalk,
    fs: {
      ...fs,
      lstatSync: (path) => {
        if (path === join(pkg, 'device').replace(/\\/g, '/')) {
          return { isFile: () => false, isDirectory: () => false }
        }

        return fs.lstatSync(path)
      },
    },
  })

  const files = await packlist({ path: pkg })
  t.same(files, [
    'index.js',
    'package.json',
  ])
})
