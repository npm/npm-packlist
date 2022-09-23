#!/usr/bin/env node
'use strict'

const Arborist = require('@npmcli/arborist')
const packlist = require('../../')

const dirs = []
let doSort = false
process.argv.slice(2).forEach(arg => {
  if (arg === '-h' || arg === '--help') {
    console.log('usage: npm-packlist [-s --sort] [directory, directory, ...]')
    process.exit(0)
  } else if (arg === '-s' || arg === '--sort') {
    doSort = true
  } else {
    dirs.push(arg)
  }
})

const sort = list => doSort ? list.sort((a, b) => a.localeCompare(b, 'en')) : list

const main = async () => {
  if (!dirs.length) {
    const path = process.cwd()
    const arborist = new Arborist({ path })
    const tree = await arborist.loadActual()
    const results = await packlist({ path, tree })
    console.log(sort(results).join('\n'))
  } else {
    for (const dir of dirs) {
      const arborist = new Arborist({ path: dir })
      const tree = await arborist.loadActual()
      console.group(`> ${dir}`)
      const results = await packlist({ path: dir, tree })
      console.log(sort(results).join('\n'))
      console.groupEnd()
    }
  }
}

// coverage disabled for catch handler because we don't need to test that
main().catch(/* istanbul ignore next */(err) => {
  process.exitCode = 1
  console.error(err.stack)
})
