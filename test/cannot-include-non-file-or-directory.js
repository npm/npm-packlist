'use strict'

const Arborist = require('@npmcli/arborist')
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

  // mock glob so the Path object for `device` reports as neither file nor
  // directory; this is the path through which packlist now resolves `files[]`
  // entries (no separate lstatSync probe), so the test must intercept here.
  const realGlob = require('glob')
  const packlist = t.mock('../', {
    'ignore-walk': ignoreWalk,
    glob: {
      ...realGlob,
      globSync: (pattern, options) => {
        const real = realGlob.globSync(pattern, options)
        return real.map((entry) => {
          if (typeof entry === 'string') {
            return entry
          }
          if (entry.name === 'device') {
            entry.isFile = () => false
            entry.isDirectory = () => false
            entry.isSymbolicLink = () => false
          }
          return entry
        })
      },
    },
  })

  const arborist = new Arborist({ path: pkg })
  const tree = await arborist.loadActual()
  const files = await packlist(tree)
  t.same(files, [
    'index.js',
    'package.json',
  ])
})
