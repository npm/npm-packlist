'use strict'

const t = require('tap')
const Walker = require('../').Walker
const sort = Walker.prototype.sort

t.same([
  'a/b/1',
  'cat',
  'dog',
  'chai',
  'package.json',
  'node_modules/b/c',
  'asdf.js',
  'node_modules/a/b/c',
  'a/b/c/d/e/f/g',
  'a/b/x/y',
].sort(sort), [
  'a/b/1',
  'node_modules/a/b/c',
  'node_modules/b/c',
  'cat',
  'chai',
  'dog',
  'a/b/c/d/e/f/g',
  'a/b/x/y',
  'asdf.js',
  'package.json',
])
