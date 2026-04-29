# npm-packlist

Get a list of the files to add from a folder into an npm package.

These can be handed to [tar](http://npm.im/tar) like so to make an npm
package tarball:

```js
const Arborist = require('@npmcli/arborist')
const packlist = require('npm-packlist')
const tar = require('tar')
const packageDir = '/path/to/package'
const packageTarball = '/path/to/package.tgz'

const arborist = new Arborist({ path: packageDir })
arborist.loadActual().then((tree) => {
  packlist(tree)
    .then(files => tar.create({
      prefix: 'package/',
      cwd: packageDir,
      file: packageTarball,
      gzip: true
    }, files))
    .then(_ => {
      // tarball has been created, continue with your day
    })
  })
```

This uses the following rules:

1. If a `package.json` file is found, and it has a `files` list,
   then ignore everything that isn't matched by `files`.  Always include the
   root readme, license, licence and copying files, if they exist, as well
   as the package.json file itself.
2. If there's no `package.json` file (or it has no `files` list), and
   there is a `.npmignore` file, then ignore all the files in the
   `.npmignore` file.
3. If there's no `package.json` with a `files` list, and there's no
   `.npmignore` file, but there is a `.gitignore` file, then ignore
   all the files in the `.gitignore` file.
4. Everything in the root `node_modules` is ignored, unless it's a
   bundled dependency.  If it IS a bundled dependency, and it's a
   symbolic link, then the target of the link is included, not the
   symlink itself.
5. Unless they're explicitly included (by being in a `files` list, or
   a `!negated` rule in a relevant `.npmignore` or `.gitignore`),
   always ignore certain common cruft files:

    1. .npmignore and .gitignore files (their effect is in the package
       already, there's no need to include them in the package)
    2. editor junk like `.*.swp`, `._*` and `.*.orig` files
    3. `.npmrc` files (these may contain private configs)
    4. The `node_modules/.bin` folder
    5. Waf and gyp cruft like `/build/config.gypi` and `.lock-wscript`
    6. Darwin's `.DS_Store` files because wtf are those even
    7. `npm-debug.log` files at the root of a project

    You can explicitly re-include most of these with a negated ignore file rule.
    A small set of files are always ignored regardless of `files` rules:
    `.git`, `.npmrc`, and `node_modules`.

Only the `package.json` file in the very root of the project is ever
inspected for a `files` list.  Below the top level of the root package,
`package.json` is treated as just another file, and no package-specific
semantics are applied.

### Interpretation of the `files` list

Each entry in the `package.json` `files` list is interpreted as a glob
pattern, expanded against the package root using node's built-in
[`fs.globSync`](https://nodejs.org/api/fs.html#fsglobsyncpattern-options).
Literal paths (`lib`, `src/index.js`) are valid globs and resolve to
themselves; pattern entries (`dist-*`, `**/*.js`) resolve to every
matching entry on disk; entries that match nothing are silently dropped.

When an entry matches a directory, the directory and all of its contents
are included.  This is a documented convenience: writing
`"files": ["dist"]` does not require also writing `"dist/**"`.

A leading `!` makes the entry a negation, removing matches from the
result.  Negations are evaluated in order, so a later positive entry
can re-include something a previous negation excluded.

#### Pattern semantics are anchored to the package root

Glob patterns are evaluated as paths relative to the package root, not as
basename-anywhere matchers.  In particular:

* `"*.js"` matches `.js` files at the package root, not at every depth.
  Use `"**/*.js"` to match at every depth.
* `"!readme.md"` removes only the root `readme.md`.  Use
  `"!**/readme.md"` to remove `readme.md` at every depth.

Negations only exclude paths that exist on disk at packlist time: a `!path`
entry that matches nothing is silently dropped, same as a positive entry
that matches nothing.  A typo'd negation has no effect.

#### Interaction with `.npmignore`

If a `package.json` `files` array is present, any **top-level**
`.npmignore` and `.gitignore` files are ignored: the `files` array is
the sole source of inclusion at the package root.

`.npmignore` files in subdirectories are still honored within their
subtree.  For example, with this package.json:

```json
{
  "files": [ "dir" ]
}
```

a `.npmignore` at `dir/.npmignore` (and any nested subdirectory) will
be applied.  This means a file listed both in `files` and excluded by a
nested `.npmignore` will be excluded from the tarball; if you need such
a file to ship, remove the `.npmignore` rule.

## API

Same API as [ignore-walk](http://npm.im/ignore-walk), except providing a `tree` is required and there are hard-coded file list and rule sets.

The `Walker` class requires an [arborist](https://github.com/npm/cli/tree/latest/workspaces/arborist) tree, and if any bundled dependencies are found will include them as well as their own dependencies in the resulting file set.
