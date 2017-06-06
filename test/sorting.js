'use strict'
const t = require('tap')
const Walker = require('../').Walker
const sort = Walker.prototype.sort

// package.json always comes first
// then files in the root, sorted alphabetically
// then folders other than node_modules sorted alphabetically
// then the deps in the back
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
  'a/b/c/d/e/f/g',
  'a/b/x/y',
  'node_modules/a/b/c',
  'node_modules/b/c'
])
