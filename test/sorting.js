const t = require('tap')
const Walker = require('../').Walker
const sort = Walker.prototype.sort

// package.json always comes first
// then files in the root, sorted alphabetically
// then folders in increasing depth, alphasorted
// then all the contents of node_modules, sorted
// alphabetically, but with no regard for depth.
t.same([
  'a/b/1',
  'package.json',
  'node_modules/b/c',
  'asdf.js',
  'node_modules/a/b/c',
  'a/b/c/d/e/f/g',
  'a/b/x/y'
].sort(sort), [
  'package.json',
  'asdf.js',
  'a/b/1',
  'a/b/x/y',
  'a/b/c/d/e/f/g',
  'node_modules/a/b/c',
  'node_modules/b/c'
])
