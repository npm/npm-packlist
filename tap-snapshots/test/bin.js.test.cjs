/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/bin.js TAP --sort > expect resolving Promise 1`] = `
Object {
  "code": 0,
  "signal": null,
  "stderr": "",
  "stdout": String(
    index.js
    lib/cat.js
    lib/chai.js
    lib/dog.js
    lib/index.js
    LICENSE.txt
    package.json
    README.md
    
  ),
}
`

exports[`test/bin.js TAP -h > expect resolving Promise 1`] = `
Object {
  "code": 0,
  "signal": null,
  "stderr": "",
  "stdout": "usage: npm-packlist [-s --sort] [directory, directory, ...]\\n",
}
`

exports[`test/bin.js TAP -s > expect resolving Promise 1`] = `
Object {
  "code": 0,
  "signal": null,
  "stderr": "",
  "stdout": String(
    index.js
    lib/cat.js
    lib/chai.js
    lib/dog.js
    lib/index.js
    LICENSE.txt
    package.json
    README.md
    
  ),
}
`

exports[`test/bin.js TAP dir argument > expect resolving Promise 1`] = `
Object {
  "code": 0,
  "signal": null,
  "stderr": "",
  "stdout": String(
    > .
    lib/cat.js
    lib/chai.js
    lib/dog.js
    index.js
    lib/index.js
    package.json
    README.md
    LICENSE.txt
    
  ),
}
`

exports[`test/bin.js TAP no args > expect resolving Promise 1`] = `
Object {
  "code": 0,
  "signal": null,
  "stderr": "",
  "stdout": String(
    lib/cat.js
    lib/chai.js
    lib/dog.js
    index.js
    lib/index.js
    package.json
    README.md
    LICENSE.txt
    
  ),
}
`
