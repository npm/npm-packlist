'use strict'
const t = require('tap')
const Walker = require('../').Walker
const sort = Walker.prototype.sort

t.matchSnapshot([
  'a/b/1',
  'package.json',
  'node_modules/b/c',
  'asdf.js',
  'node_modules/a/b/c',
  'a/b/c/d/e/f/g',
  'a/b/x/y',
].sort(sort))
