'use strict'

const { Walker: IgnoreWalker } = require('ignore-walk')
const { escape: escapeGlob, globSync } = require('glob')
const { readFileSync: readFile } = require('node:fs')
const { basename, dirname, extname, join, posix, relative, resolve, sep } = require('node:path')
const { log } = require('proc-log')

// symbols used to represent synthetic rule sets
const defaultRules = Symbol('npm-packlist.rules.default')
const globalRules = Symbol('npm-packlist.rules.global')
const strictRules = Symbol('npm-packlist.rules.strict')

// There may be others, but :?|<> are handled by node-tar
const nameIsBadForWindows = file => /\*/.test(file)

// these are the default rules that are applied to everything except for non-link bundled deps
const defaults = [
  '.npmignore',
  '.gitignore',
  '**/.git',
  '**/.svn',
  '**/.hg',
  '**/CVS',
  '**/.git/**',
  '**/.svn/**',
  '**/.hg/**',
  '**/CVS/**',
  '/.lock-wscript',
  '/.wafpickle-*',
  '/build/config.gypi',
  'npm-debug.log',
  '**/.npmrc',
  '.*.swp',
  '.DS_Store',
  '**/.DS_Store/**',
  '._*',
  '**/._*/**',
  '*.orig',
  '/archived-packages/**',
]

const strictDefaults = [
  // these are forcibly excluded
  '/.git',
]

const normalizePath = (path) => path.split('\\').join('/')

// converts a native path to a forward-slash one. On POSIX a backslash is a valid file name
// character, not a separator, so it must be kept or the path would point somewhere else.
const toPosixPath = (path) => path.split(sep).join(posix.sep)

// escapes a path so that ignore-walk matches it literally: file names may contain glob
// characters (e.g. `dist/[id].js`), which must not be expanded or reinterpreted
const literalRule = (path) => escapeGlob(path, { magicalBraces: true })

// a rule for ignore-walk that matches a set of literal paths, used for the paths that the
// package.json "files" globs expand to. It stands in for the rules `/file`, `/dir` and
// `/dir/**` compiled with ignore-walk's options ({ matchBase, dot, flipNegate, nocase }),
// one per matched path, but answers in O(path depth) instead of O(number of paths), and
// never reinterprets glob characters that are part of a file name (e.g. `[id].js`).
// ignore-walk only uses the `negate`, `globParts` and `match(path, partial)` members, which
// test/package-json-files-many-matches.js checks.
class PathSetRule {
  constructor ({ negate, files, dirs }) {
    this.negate = negate
    // anchored rules are never "relative" (see isRelativeRule in ignore-walk's filterEntry)
    this.globParts = [['', '\0', '\0']]
    // ignore-walk compiles its rules with nocase: true
    this.files = new Set([...files].map((p) => p.toLowerCase()))
    this.dirs = new Set([...dirs].map((p) => p.toLowerCase()))
    // every ancestor of a matched path, so that the walker can descend towards it. ignore-walk
    // only asks for partial matches of negated rules (inclusions), so other rules skip it.
    this.ancestors = new Set()
    if (negate) {
      for (const p of [...this.files, ...this.dirs]) {
        for (let i = p.indexOf('/'); i !== -1; i = p.indexOf('/', i + 1)) {
          this.ancestors.add(p.slice(0, i))
        }
      }
    }
  }

  // ignore-walk calls this with `/entry`, `entry`, `/entry/` and `entry/`, where entry is a
  // non-empty relative path without repeated slashes, and passes `partial` only with the first
  // two forms. Only the anchored forms can match the anchored rules this stands in for.
  match (path, partial = false) {
    if (!path.startsWith('/')) {
      return false
    }
    const rel = path.slice(1, path.endsWith('/') ? -1 : undefined).toLowerCase()
    // `/file` and `/dir` match the path itself, with or without a trailing slash
    if (this.files.has(rel) || this.dirs.has(rel)) {
      return true
    }
    // `/dir/**` matches everything below dir
    for (let i = rel.indexOf('/'); i !== -1; i = rel.indexOf('/', i + 1)) {
      if (this.dirs.has(rel.slice(0, i))) {
        return true
      }
    }
    // in partial mode, a path matches if it could be a leading part of a matched path
    return partial && this.ancestors.has(rel)
  }
}

const readOutOfTreeIgnoreFiles = (root, rel, result = []) => {
  for (const file of ['.npmignore', '.gitignore']) {
    try {
      const ignoreContent = readFile(join(root, file), { encoding: 'utf8' })
      result.push(ignoreContent)
      // break the loop immediately after reading, this allows us to prioritize
      // the .npmignore and discard the .gitignore if one is present
      break
    } catch (err) {
      // we ignore ENOENT errors completely because we don't care if the file doesn't exist
      // but we throw everything else because failing to read a file that does exist is
      // something that the user likely wants to know about
      // istanbul ignore next -- we do not need to test a thrown error
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
  }

  if (!rel) {
    return result
  }

  const firstRel = rel.split(sep, 1)[0]
  const newRoot = join(root, firstRel)
  const newRel = relative(newRoot, join(root, rel))

  return readOutOfTreeIgnoreFiles(newRoot, newRel, result)
}

class PackWalker extends IgnoreWalker {
  constructor (tree, opts) {
    const options = {
      ...opts,
      includeEmpty: false,
      follow: false,
      // we path.resolve() here because ignore-walk doesn't do it and we want full paths
      path: toPosixPath(resolve(opts?.path || tree.path)),
      // globalRules belongs on the root walker only. Child walkers reach it through
      // parent.filterEntry, where package.json rules can still override it; reapplying
      // globalRules at the child level would defeat that override.
      ignoreFiles: opts?.ignoreFiles || (opts?.parent ? [
        defaultRules,
        'package.json',
        '.npmignore',
        '.gitignore',
        strictRules,
      ] : [
        defaultRules,
        globalRules,
        'package.json',
        '.npmignore',
        '.gitignore',
        strictRules,
      ]),
    }

    super(options)

    this.isPackage = options.isPackage
    this.seen = options.seen || new Set()
    this.tree = tree
    this.globalIgnoreFile = options.globalIgnoreFile || null
    this.globalIgnoreRules = options.globalIgnoreRules || null

    const additionalDefaults = []
    if (options.prefix && options.workspaces) {
      const path = normalizePath(options.path)
      const prefix = normalizePath(options.prefix)
      const workspaces = options.workspaces.map((ws) => normalizePath(ws))

      // istanbul ignore else - this does nothing unless we need it to
      if (path !== prefix && workspaces.includes(path)) {
        // if path and prefix are not the same directory, and workspaces has path in it
        // then we know path is a workspace directory. in order to not drop ignore rules
        // from directories between the workspaces root (prefix) and the workspace itself
        // (path) we need to find and read those now
        const relpath = relative(options.prefix, dirname(options.path))
        additionalDefaults.push(...readOutOfTreeIgnoreFiles(options.prefix, relpath))
      } else if (path === prefix) {
        // on the other hand, if the path and prefix are the same, then we ignore workspaces
        // so that we don't pack a workspace as part of the root project. append them as
        // normalized relative paths from the root
        additionalDefaults.push(...workspaces.map((w) =>
          literalRule(normalizePath(relative(options.path, w)))))
      }
    }

    // go ahead and inject the default rules now
    this.injectRules(defaultRules, [...defaults, ...additionalDefaults])

    // inject the global rules from the user's ignore file. positioned between
    // defaultRules and package.json so an explicit entry in the package "files"
    // field can still override. only the root walker carries globalRules in its
    // ignoreFiles list; child walkers see global exclusions via parent.filterEntry,
    // which is what lets the package.json "files" rules override them.
    if (this.globalIgnoreRules === null && this.globalIgnoreFile) {
      try {
        this.globalIgnoreRules = readFile(this.globalIgnoreFile, { encoding: 'utf8' })
      } catch (err) {
        // istanbul ignore next -- only ENOENT is expected here
        if (err.code !== 'ENOENT') {
          throw err
        }
        this.globalIgnoreRules = ''
      }
    }
    if (this.globalIgnoreRules) {
      this.injectRules(globalRules, [this.globalIgnoreRules])
      // istanbul ignore else -- globalIgnoreRules without a filename only happens when
      // a caller pre-populates rules directly instead of going through globalIgnoreFile
      if (this.globalIgnoreFile) {
        log.silly('global-ignore-file', `applied rules from ${this.globalIgnoreFile}`)
      }
    }

    if (!this.isPackage) {
      // if this instance is not a package, then place some strict default rules
      this.injectRules(strictRules, [...strictDefaults])
    }
  }

  // overridden method: we intercept the reading of the package.json file here so that we can
  // process it into both the package.json file rules as well as the strictRules synthetic rule set
  addIgnoreFile (file, callback) {
    // if we're adding anything other than package.json, then let ignore-walk handle it
    if (file !== 'package.json' || !this.isPackage) {
      return super.addIgnoreFile(file, callback)
    }

    return this.processPackage(callback)
  }

  // overridden method: if we're done, but we're a package, then we also need to evaluate bundles
  // before we actually emit our done event
  emit (ev, data) {
    if (ev !== 'done' || !this.isPackage) {
      return super.emit(ev, data)
    }

    // we intentionally delay the done event while keeping the function sync here
    // eslint-disable-next-line promise/catch-or-return, promise/always-return
    this.gatherBundles().then(() => {
      super.emit('done', this.result)
    })
    return true
  }

  // overridden method: before actually filtering, we make sure that we've removed the rules for
  // files that should no longer take effect due to our order of precedence
  filterEntries () {
    if (this.ignoreRules['package.json']) {
      // package.json means no .npmignore or .gitignore
      this.ignoreRules['.npmignore'] = null
      this.ignoreRules['.gitignore'] = null
    } else if (this.ignoreRules['.npmignore']) {
      // .npmignore means no .gitignore
      this.ignoreRules['.gitignore'] = null
    } else if (this.ignoreRules['.gitignore'] && !this.ignoreRules['.npmignore'] && !this.parent) {
      log.warn(
        'gitignore-fallback',
        'No .npmignore file found, using .gitignore for file exclusion. Consider creating a .npmignore file to explicitly control published files.'
      )
    }

    return super.filterEntries()
  }

  // overridden method: we never want to include anything that isn't a file or directory
  onstat (opts, callback) {
    if (!opts.st.isFile() && !opts.st.isDirectory()) {
      return callback()
    }

    return super.onstat(opts, callback)
  }

  // overridden method: we want to refuse to pack files that are invalid, node-tar protects us from
  // a lot of them but not all
  stat (opts, callback) {
    if (nameIsBadForWindows(opts.entry)) {
      return callback()
    }

    return super.stat(opts, callback)
  }

  // overridden method: this is called to create options for a child walker when we step
  // in to a normal child directory (this will never be a bundle). the default method here
  // copies the root's `ignoreFiles` value, but we don't want to respect package.json for
  // subdirectories, so we override it with a list that intentionally omits package.json
  walkerOpt (entry, opts) {
    let ignoreFiles = null

    // however, if we have a tree, and we have workspaces, and the directory we're about
    // to step into is a workspace, then we _do_ want to respect its package.json
    if (this.tree.workspaces) {
      const workspaceDirs = [...this.tree.workspaces.values()]
        .map((dir) => toPosixPath(dir))

      const entryPath = toPosixPath(join(this.path, entry))
      if (workspaceDirs.includes(entryPath)) {
        ignoreFiles = [
          defaultRules,
          'package.json',
          '.npmignore',
          '.gitignore',
          strictRules,
        ]
      }
    } else {
      ignoreFiles = [
        defaultRules,
        '.npmignore',
        '.gitignore',
        strictRules,
      ]
    }

    return {
      ...super.walkerOpt(entry, opts),
      ignoreFiles,
    }
  }

  // overridden method: we want child walkers to be instances of this class, not ignore-walk
  walker (entry, opts, callback) {
    new PackWalker(this.tree, this.walkerOpt(entry, opts)).on('done', callback).start()
  }

  // overridden method: we use a custom sort method to help compressibility
  sort (a, b) {
    // optimize for compressibility
    // extname, then basename, then locale alphabetically
    // https://twitter.com/isntitvacant/status/1131094910923231232
    const exta = extname(a).toLowerCase()
    const extb = extname(b).toLowerCase()
    const basea = basename(a).toLowerCase()
    const baseb = basename(b).toLowerCase()

    return exta.localeCompare(extb, 'en') ||
      basea.localeCompare(baseb, 'en') ||
      a.localeCompare(b, 'en')
  }

  // convenience method: this joins the given rules with newlines, appends a trailing newline,
  // and calls the internal onReadIgnoreFile method
  injectRules (filename, rules, callback = () => {}) {
    this.onReadIgnoreFile(filename, `${rules.join('\n')}\n`, callback)
  }

  // custom method: this is called by addIgnoreFile when we find a package.json, it uses the
  // arborist tree to pull both default rules and strict rules for the package
  processPackage (callback) {
    const {
      bin,
      browser,
      files,
      main,
      patchedDependencies,
    } = this.tree.package

    // rules that always apply, whatever the other rules say: `!` rules force a path into the
    // package, the others force it out
    const strict = [
      ...strictDefaults,
      '!/package.json',
      '!/readme{,.*[^~$]}',
      '!/copying{,.*[^~$]}',
      '!/license{,.*[^~$]}',
      '!/licence{,.*[^~$]}',
      '/.git',
      '/node_modules',
      '.npmrc',
      '/package-lock.json',
      '/npm-shrinkwrap.json',
      '/yarn.lock',
      '/pnpm-lock.yaml',
      '/bun.lockb',
      '/bun.lock',
      '/.npm-extension.mjs',
      '/.npm-extension.cjs',
    ]

    // paths included by the "files" array, used to warn about packed patch files below
    const includedFiles = new Set()
    const includedDirs = new Set()

    // if we have a files array in our package, we need to pull rules from it
    if (files) {
      // rules are evaluated in order and the last match wins, so the matches of consecutive
      // entries of the same sign only matter as a whole: they are collected into one group,
      // which becomes one rule. One rule per matched path would make every walked entry
      // scan every matched path, which is quadratic in the size of the package.
      const matchGroups = []
      // the group a match of the given sign goes into. Groups are only opened by an actual
      // match: an entry that matches nothing would add an empty rule that every walked entry
      // is checked against, and would split the same-sign groups around it.
      const groupFor = (negate) => {
        let group = matchGroups[matchGroups.length - 1]
        if (!group || group.negate !== negate) {
          group = { negate, files: new Set(), dirs: new Set() }
          matchGroups.push(group)
        }
        return group
      }
      for (const entry of files) {
        const isNegation = entry.startsWith('!')
        // normalize: strip leading `!`s, `./`, a single leading `/`, and trailing slashes.
        // trailing slashes confuse glob; the leading forms are equivalent to their stripped versions for glob expansion.
        const pattern = (isNegation ? entry.replace(/^!+/, '') : entry)
          .replace(/^\.?\//, '')
          .replace(/\/+$/, '')
        if (!pattern) {
          continue
        }

        // expand the entry as a glob against the package root.
        // literal paths (e.g. `lib`, `lib/foo.js`) are valid globs and resolve to themselves;
        // patterns (e.g. `dist-*`, `**/*.js`) resolve to all matching entries;
        // typos and non-existent entries resolve to nothing.
        let matches = []
        try {
          matches = globSync(pattern, { cwd: this.path, withFileTypes: true, dot: true })
        } catch {
          // unparseable globs produce no matches and drop silently.
          // (Pre-v11 instead fell through to push the raw entry as an ignore-walk pattern rule; we deliberately don't preserve that.)
        }

        // a positive entry un-ignores its matches from the surrounding `*` deny-all (a `!` rule); a negation re-ignores them.
        // directory matches expand to also include their contents; this is documented `files[]` behavior, not a glob hack.
        const negate = !isNegation
        for (const match of matches) {
          const rel = match.relativePosix()
          // istanbul ignore next -- defensive: glob with withFileTypes returns the cwd as an entry with an empty relative path; skip it.
          if (!rel) {
            continue
          }
          if (match.isDirectory()) {
            groupFor(negate).dirs.add(rel)
            if (negate) {
              includedDirs.add(rel)
            }
            continue
          }
          // istanbul ignore else -- non-file-non-dir matches (sockets, fifos, broken symlinks) drop silently.
          if (match.isFile()) {
            groupFor(negate).files.add(rel)
            if (negate) {
              includedFiles.add(rel)
            }
          }
        }
      }

      // we start with a '*' rule to exclude everything, followed by one rule per group of
      // "files" matches
      const pathRules = matchGroups.map((group) => new PathSetRule(group))
      this.injectRules('package.json', ['*'], () => {
        this.ignoreRules['package.json'].push(...pathRules)
      })
    }

    // browser is required
    if (browser) {
      strict.push(`!/${literalRule(browser)}`)
    }

    // main is required
    if (main) {
      strict.push(`!/${literalRule(main)}`)
    }

    // each bin is required
    if (bin) {
      for (const key in bin) {
        strict.push(`!/${literalRule(bin[key])}`)
      }
    }

    // patch files declared in patchedDependencies are project-local fixes and must never ship.
    // patchedDependencies is root-only state, so this applies only to the package being packed.
    // each declared patch file is force-excluded even when it was added via "files".
    // only the exact files are excluded, never their directory, so a shared dir keeps its other contents.
    if (this.tree.isProjectRoot && patchedDependencies && typeof patchedDependencies === 'object') {
      for (const patchPath of Object.values(patchedDependencies)) {
        if (typeof patchPath !== 'string') {
          continue
        }
        const rel = normalizePath(patchPath).replace(/^\.?\//, '').replace(/\/+$/, '')
        // skip absolute paths or paths that escape the package root, which are never packed anyway
        if (!rel || rel.startsWith('/') || rel === '..' || rel.startsWith('../') || rel.includes('/../')) {
          continue
        }
        // warn when a "files" entry pulled the patch file in, either directly or via its directory
        if (includedFiles.has(rel) || includedDirs.has(normalizePath(dirname(rel)))) {
          log.warn(
            'patched-dependencies',
            `excluding "${rel}" from the package tarball: patch files in patchedDependencies must not be published`
          )
        }
        strict.push(`/${literalRule(rel)}`)
      }
    }

    // and now we add all of the strict rules to our synthetic file
    this.injectRules(strictRules, strict, callback)
  }

  // custom method: after we've finished gathering the files for the root package, we call this
  // before emitting the 'done' event in order to gather all of the files for bundled deps
  async gatherBundles () {
    if (this.seen.has(this.tree)) {
      return
    }

    // add this node to our seen tracker
    this.seen.add(this.tree)

    // if we're the project root, then we look at our bundleDependencies, otherwise we got here
    // because we're a bundled dependency of the root, which means we need to include all prod
    // and optional dependencies in the bundle
    let toBundle
    if (this.tree.isProjectRoot) {
      const { bundleDependencies } = this.tree.package
      toBundle = bundleDependencies || []
    } else {
      const { dependencies, optionalDependencies } = this.tree.package
      toBundle = Object.keys(dependencies || {}).concat(Object.keys(optionalDependencies || {}))
    }

    for (const dep of toBundle) {
      const edge = this.tree.edgesOut.get(dep)
      // no edgeOut = missing node, so skip it. we can't pack it if it's not here
      // we also refuse to pack peer dependencies and dev dependencies
      if (!edge || edge.peer || edge.dev) {
        continue
      }

      // get a reference to the node we're bundling
      const node = this.tree.edgesOut.get(dep).to
      // if there's no node, this is most likely an optional dependency that hasn't been
      // installed. just skip it.
      if (!node) {
        continue
      }
      // we use node.path for the path because we want the location the node was linked to,
      // not where it actually lives on disk
      const path = node.path
      // but link nodes don't have edgesOut, so we need to pass in the target of the node
      // in order to make sure we correctly traverse its dependencies
      const tree = node.target

      // and start building options to be passed to the walker for this package
      const walkerOpts = {
        path,
        isPackage: true,
        ignoreFiles: [],
        seen: this.seen, // pass through seen so we can prevent infinite circular loops
      }

      // if our node is a link, we apply defaultRules. we don't do this for regular bundled
      // deps because their .npmignore and .gitignore files are excluded by default and may
      // override defaults
      if (node.isLink) {
        walkerOpts.ignoreFiles.push(defaultRules)
      }

      // _all_ nodes will follow package.json rules from their package root
      walkerOpts.ignoreFiles.push('package.json')

      // only link nodes will obey .npmignore or .gitignore
      if (node.isLink) {
        walkerOpts.ignoreFiles.push('.npmignore')
        walkerOpts.ignoreFiles.push('.gitignore')
      }

      // _all_ nodes follow strict rules
      walkerOpts.ignoreFiles.push(strictRules)

      // create a walker for this dependency and gather its results
      const walker = new PackWalker(tree, walkerOpts)
      const bundled = await new Promise((pResolve, pReject) => {
        walker.on('error', pReject)
        walker.on('done', pResolve)
        walker.start()
      })

      // now we make sure we have our paths correct from the root, and accumulate everything into
      // our own result set to deduplicate
      const relativeFrom = relative(this.root, walker.path)
      for (const file of bundled) {
        this.result.add(toPosixPath(join(relativeFrom, file)))
      }
    }
  }
}

const walk = (tree, options, callback) => {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  const p = new Promise((pResolve, pReject) => {
    new PackWalker(tree, { ...options, isPackage: true })
      .on('done', pResolve).on('error', pReject).start()
  })
  return callback ? p.then(res => callback(null, res), callback) : p
}

module.exports = walk
walk.Walker = PackWalker
