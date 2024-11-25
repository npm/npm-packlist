# Changelog

## [10.0.0](https://github.com/npm/npm-packlist/compare/v9.0.0...v10.0.0) (2024-11-25)
### ⚠️ BREAKING CHANGES
* this module is now compatible with the following node versions: ^20.17.0 || >=22.9.0
* `bun.lockb` is now included in the strict ignorelist
### Features
* [`9f74fd3`](https://github.com/npm/npm-packlist/commit/9f74fd37c857840a8c361a8ada8a9e9524136658) [#168](https://github.com/npm/npm-packlist/pull/168) add `bun.lockb` to ignorelist (#168) (@antongolub)
### Bug Fixes
* [`67fef03`](https://github.com/npm/npm-packlist/commit/67fef031feea8990a8a288c71d35a8a96e7d9e8e) update engines to ^20.17.0 || >=22.9.0 (#254) (@wraithgar)
### Chores
* [`fd425fa`](https://github.com/npm/npm-packlist/commit/fd425fa70c15d14c2356656c67deb660680f714d) bump @npmcli/eslint-config from 4.0.5 to 5.0.1 (#250) (@dependabot[bot])
* [`3b66b5a`](https://github.com/npm/npm-packlist/commit/3b66b5a16cf0b23a39487c17cc5e755b57c89496) [#252](https://github.com/npm/npm-packlist/pull/252) bump @npmcli/arborist from 7.5.4 to 8.0.0 (#252) (@dependabot[bot])
* [`e688d26`](https://github.com/npm/npm-packlist/commit/e688d26302629e0b6eb7b1e8ee3d152d06306913) bump @npmcli/template-oss from 4.23.3 to 4.23.4 (#251) (@dependabot[bot], @npm-cli-bot)

## [9.0.0](https://github.com/npm/npm-packlist/compare/v8.0.2...v9.0.0) (2024-09-25)
### ⚠️ BREAKING CHANGES
* `npm-packlist` now supports node `^18.17.0 || >=20.5.0`
### Bug Fixes
* [`4679b12`](https://github.com/npm/npm-packlist/commit/4679b12aabbcd524a4b6ccd42601297a51b6bd7e) [#247](https://github.com/npm/npm-packlist/pull/247) align to npm 10 node engine range (@hashtagchris)
### Dependencies
* [`b0500f4`](https://github.com/npm/npm-packlist/commit/b0500f4cb6a2e2e30d7c9df33dc367d6632f2d0a) [#247](https://github.com/npm/npm-packlist/pull/247) `ignore-walk@7.0.0`
### Chores
* [`46ed801`](https://github.com/npm/npm-packlist/commit/46ed8013989409ab1f50354bcb6e3c0f989bd245) [#245](https://github.com/npm/npm-packlist/pull/245) bump @npmcli/eslint-config from 4.0.5 to 5.0.0 (#245) (@dependabot[bot])
* [`625ddca`](https://github.com/npm/npm-packlist/commit/625ddca24b20a0934b4a5b9ae14fee2232be979f) [#240](https://github.com/npm/npm-packlist/pull/240) bump @npmcli/arborist from 6.5.1 to 7.5.4 (#240) (@dependabot[bot])
* [`e2eb28d`](https://github.com/npm/npm-packlist/commit/e2eb28dec2f8abf75357564cca683c049006be50) [#247](https://github.com/npm/npm-packlist/pull/247) run template-oss-apply (@hashtagchris)
* [`3c27bb3`](https://github.com/npm/npm-packlist/commit/3c27bb305d769ad0f8fd128a8b99787162444de2) [#230](https://github.com/npm/npm-packlist/pull/230) bump @npmcli/template-oss to 4.22.0 (@lukekarrys)
* [`fa9e80d`](https://github.com/npm/npm-packlist/commit/fa9e80ddfa348daf690b548a22a887f3c7fadeec) [#242](https://github.com/npm/npm-packlist/pull/242) bump @npmcli/template-oss from 4.22.0 to 4.23.3 (#242) (@dependabot[bot])
* [`cb4a823`](https://github.com/npm/npm-packlist/commit/cb4a823cd42d50475a8e1e7582b95b15766f5ca2) [#230](https://github.com/npm/npm-packlist/pull/230) postinstall for dependabot template-oss PR (@lukekarrys)

## [8.0.2](https://github.com/npm/npm-packlist/compare/v8.0.1...v8.0.2) (2024-01-03)

### Bug Fixes

* [`728d68a`](https://github.com/npm/npm-packlist/commit/728d68ad3dfeb86de6d319f05435a6ac7319232e) [#214](https://github.com/npm/npm-packlist/pull/214) handling of directory glob (#214) (@mohd-akram)
* [`837af58`](https://github.com/npm/npm-packlist/commit/837af580e4b5623afdc1d034b533290bc0a93ebb) [#210](https://github.com/npm/npm-packlist/pull/210) avoid modifying singleton variable (#210) (@mohd-akram)

## [8.0.1](https://github.com/npm/npm-packlist/compare/v8.0.0...v8.0.1) (2023-12-06)

### Bug Fixes

* [`8fc4df1`](https://github.com/npm/npm-packlist/commit/8fc4df1b01ddfa99c476c1108f557ab6e172b28c) [#204](https://github.com/npm/npm-packlist/pull/204) always ignore .npmrc files at every level (@wraithgar)
* [`cd5ddbd`](https://github.com/npm/npm-packlist/commit/cd5ddbd9fc7069d62fd89e0de741523e408c889b) [#205](https://github.com/npm/npm-packlist/pull/205) preserve slashes in specified files (#205) (@mohd-akram)

### Dependencies

* [`6058cc5`](https://github.com/npm/npm-packlist/commit/6058cc5ffd8850c0bc7d0235586d21d5724f1c78) [#204](https://github.com/npm/npm-packlist/pull/204) `ignore-walk@6.0.4`

### Chores

* [`20fe0cd`](https://github.com/npm/npm-packlist/commit/20fe0cdfbf0d4b447745c6149b502510f5a9655a) [#207](https://github.com/npm/npm-packlist/pull/207) bump @npmcli/template-oss from 4.21.1 to 4.21.2 (#207) (@dependabot[bot], @lukekarrys)
* [`f8be7bd`](https://github.com/npm/npm-packlist/commit/f8be7bd0d4954b675c3da9f4954df15fb60dc071) [#202](https://github.com/npm/npm-packlist/pull/202) bump @npmcli/template-oss from 4.19.0 to 4.21.1 (#202) (@dependabot[bot], @lukekarrys)
* [`8e1d900`](https://github.com/npm/npm-packlist/commit/8e1d9008cf8ead74a27530d3cda89200fe40f28c) [#204](https://github.com/npm/npm-packlist/pull/204) tests reflect fixed ignore-walk rules (@wraithgar)
* [`6d7cbe9`](https://github.com/npm/npm-packlist/commit/6d7cbe9719fc16115d622398f64e588445fecfad) [#181](https://github.com/npm/npm-packlist/pull/181) postinstall for dependabot template-oss PR (@lukekarrys)
* [`80ec501`](https://github.com/npm/npm-packlist/commit/80ec50165e98050988c0bbb935faf43163fcb5af) [#181](https://github.com/npm/npm-packlist/pull/181) bump @npmcli/template-oss from 4.18.1 to 4.19.0 (@dependabot[bot])
* [`f327738`](https://github.com/npm/npm-packlist/commit/f327738576e0076592880633df358a4b9f76f3b4) [#179](https://github.com/npm/npm-packlist/pull/179) postinstall for dependabot template-oss PR (@lukekarrys)
* [`a770a96`](https://github.com/npm/npm-packlist/commit/a770a96ba042b2221aa909a172bb3ffb51f8fb22) [#179](https://github.com/npm/npm-packlist/pull/179) bump @npmcli/template-oss from 4.18.0 to 4.18.1 (@dependabot[bot])

## [8.0.0](https://github.com/npm/npm-packlist/compare/v7.0.4...v8.0.0) (2023-08-24)

### ⚠️ BREAKING CHANGES

* The files array can now be used to exclude non-root readme, license, licence, and copying files.

### Bug Fixes

* [`24344a2`](https://github.com/npm/npm-packlist/commit/24344a2ce2f5a860d8c6048c642bae8db50b9618) [#173](https://github.com/npm/npm-packlist/pull/173) exclude non-root README.md/LICENSE files (#173) (@AaronHamilton965, @rahulio96)

## [7.0.4](https://github.com/npm/npm-packlist/compare/v7.0.3...v7.0.4) (2022-12-07)

### Bug Fixes

* [`e5256de`](https://github.com/npm/npm-packlist/commit/e5256de99776ab243ab40653e960a20a8ab6a2ab) [#149](https://github.com/npm/npm-packlist/pull/149) skip missing optional deps when bundling, closes npm/cli#5924 (#149) (@nlf)

## [7.0.3](https://github.com/npm/npm-packlist/compare/v7.0.2...v7.0.3) (2022-12-07)

### Bug Fixes

* [`c6f2b69`](https://github.com/npm/npm-packlist/commit/c6f2b69b025575dc683f26f3d098e23a22c462da) [#147](https://github.com/npm/npm-packlist/pull/147) treat glob the same as globstar (#147) (@lukekarrys)

## [7.0.2](https://github.com/npm/npm-packlist/compare/v7.0.1...v7.0.2) (2022-10-26)

### Bug Fixes

* [`d5b653c`](https://github.com/npm/npm-packlist/commit/d5b653ce860f6601fb5007c7fcec903c8d58c1c8) [#140](https://github.com/npm/npm-packlist/pull/140) account for directories and files prefixed with `./` (#140) (@wraithgar)

## [7.0.1](https://github.com/npm/npm-packlist/compare/v7.0.0...v7.0.1) (2022-10-17)

### Dependencies

* [`250d589`](https://github.com/npm/npm-packlist/commit/250d5896669e2fc84e2512124c28541e5396aad8) [#136](https://github.com/npm/npm-packlist/pull/136) bump ignore-walk from 5.0.1 to 6.0.0

## [7.0.0](https://github.com/npm/npm-packlist/compare/v7.0.0-pre.1...v7.0.0) (2022-10-04)

### Features

* [`b83e0aa`](https://github.com/npm/npm-packlist/commit/b83e0aaa31936496499283fc44b773645d3dd969) [#133](https://github.com/npm/npm-packlist/pull/133) set as release (@fritzy)

## [7.0.0-pre.1](https://github.com/npm/npm-packlist/compare/v7.0.0-pre.0...v7.0.0-pre.1) (2022-10-03)

### ⚠️ BREAKING CHANGES

* if npm-shrinkwrap.json is included in your .npmignore, the shrinkwrap will now be excluded from your packlist.

### Features

* [`5e80968`](https://github.com/npm/npm-packlist/commit/5e8096883080d8d1650d4558fb62e34ce61d0dda) [#131](https://github.com/npm/npm-packlist/pull/131) npm-shrinkwrap.json files can now be ignored (#131) (@fritzy)

## [7.0.0-pre.0](https://github.com/npm/npm-packlist/compare/v6.0.1...v7.0.0-pre.0) (2022-09-26)

### ⚠️ BREAKING CHANGES

* `tree` is now the first parameter
* the arborist tree must now be provided in the options and will not be generated for you. the npm-packlist bin has also been removed.

### Features

* [`87c778e`](https://github.com/npm/npm-packlist/commit/87c778eb0f89101ff5ef4a488e614fb9e7773480) make the required tree the first parameter (@lukekarrys)
* [`123875a`](https://github.com/npm/npm-packlist/commit/123875a9db0d18c2ba91e9841ab8e15df3057e18) remove dependency on arborist, require tree to be passed in (@nlf)

## [6.0.1](https://github.com/npm/npm-packlist/compare/v6.0.0...v6.0.1) (2022-09-23)

### Dependencies

* [`f823be6`](https://github.com/npm/npm-packlist/commit/f823be6e9bc9239acbb8e8b6149f0a8b457a0d0a) [#125](https://github.com/npm/npm-packlist/pull/125) arborist@5||6||6.pre

## [6.0.0](https://github.com/npm/npm-packlist/compare/v5.1.3...v6.0.0) (2022-09-21)

### ⚠️ BREAKING CHANGES

* this module now follows a strict order of operations when applying ignore rules. if a `files` array is present in the package.json, then rules in `.gitignore` and `.npmignore` files from the root will be ignored.
* `npm-packlist` is now compatible with the following semver range for node: `^14.17.0 || ^16.13.0 || >=18.0.0`

### Features

* [`c37371b`](https://github.com/npm/npm-packlist/commit/c37371b060ee42ebaebf134f37471c8330fc4d27) [#88](https://github.com/npm/npm-packlist/pull/88) change interactions between `files` array and ignore files to be more consistent (#88) (@nlf)
* [`a2c96ef`](https://github.com/npm/npm-packlist/commit/a2c96effdadd1cee1d6b584b92a45a7d09b260cb) [#123](https://github.com/npm/npm-packlist/pull/123) postinstall for dependabot template-oss PR (@lukekarrys)

## [5.1.3](https://github.com/npm/npm-packlist/compare/v5.1.2...v5.1.3) (2022-08-25)


### Dependencies

* bump npm-bundled from 1.1.2 to 2.0.0 ([#113](https://github.com/npm/npm-packlist/issues/113)) ([de5e96b](https://github.com/npm/npm-packlist/commit/de5e96bbdd9ccf345104715fe3080c4d239b7f3b))

## [5.1.2](https://github.com/npm/npm-packlist/compare/v5.1.1...v5.1.2) (2022-08-23)


### Dependencies

* bump npm-normalize-package-bin from 1.0.1 to 2.0.0 ([#110](https://github.com/npm/npm-packlist/issues/110)) ([c97d1a8](https://github.com/npm/npm-packlist/commit/c97d1a8b0d61ed76422bd7da0adaa4285c2a1cb7))

### [5.1.1](https://github.com/npm/npm-packlist/compare/v5.1.0...v5.1.1) (2022-05-31)


### Bug Fixes

* correctly ignore .gitignore when a .npmignore is present ([#108](https://github.com/npm/npm-packlist/issues/108)) ([da1ba4a](https://github.com/npm/npm-packlist/commit/da1ba4a3051ea822d9625347e00c186677247a45))

## [5.1.0](https://github.com/npm/npm-packlist/compare/v5.0.4...v5.1.0) (2022-05-25)


### Features

* correctly handle workspace roots ([#104](https://github.com/npm/npm-packlist/issues/104)) ([d74bdd1](https://github.com/npm/npm-packlist/commit/d74bdd157ef6a701c9aeef902be9e0e51f388c98))

### [5.0.4](https://github.com/npm/npm-packlist/compare/v5.0.3...v5.0.4) (2022-05-19)


### Bug Fixes

* do not pack workspaces by default ([0f31f71](https://github.com/npm/npm-packlist/commit/0f31f71ab652c1bc9250bcb1603357ee7b4fbf28))
* respect gitignore and npmignore files in workspace roots ([839e6e8](https://github.com/npm/npm-packlist/commit/839e6e8b13dc8c5ec14fab79509649d081c3ef54))

### [5.0.3](https://github.com/npm/npm-packlist/compare/v5.0.2...v5.0.3) (2022-05-04)


### Bug Fixes

* strip leading ./ from files array entries ([#97](https://github.com/npm/npm-packlist/issues/97)) ([9f519b7](https://github.com/npm/npm-packlist/commit/9f519b7d38ee46e08dc77b3b730842a2ca0e7500))

### [5.0.2](https://github.com/npm/npm-packlist/compare/v5.0.1...v5.0.2) (2022-04-21)


### Bug Fixes

* normalize win32 paths before globbing ([16f1343](https://github.com/npm/npm-packlist/commit/16f13436ebe31144ea86e3d2c7f1f16022f82885))

### [5.0.1](https://github.com/npm/npm-packlist/compare/v5.0.0...v5.0.1) (2022-04-20)


### Dependencies

* bump glob from 7.2.0 to 8.0.1 ([#90](https://github.com/npm/npm-packlist/issues/90)) ([dc3d40a](https://github.com/npm/npm-packlist/commit/dc3d40a1b89019e5343f76c184cd2fbb296fdb27))

## [5.0.0](https://github.com/npm/npm-packlist/compare/v4.0.0...v5.0.0) (2022-04-06)


### ⚠ BREAKING CHANGES

* this module no longer supports synchronous usage

### Features

* remove synchronous interface ([#80](https://github.com/npm/npm-packlist/issues/80)) ([eb68f64](https://github.com/npm/npm-packlist/commit/eb68f64fe7d70d4776922246dd9cea5da6f1e21a))


### Bug Fixes

* remove polynomial regex ([b2e2f7b](https://github.com/npm/npm-packlist/commit/b2e2f7b9122b15c8f8041953aa07b5436232b903))
* replace deprecated String.prototype.substr() ([#85](https://github.com/npm/npm-packlist/issues/85)) ([79d6f7e](https://github.com/npm/npm-packlist/commit/79d6f7ebd5b881b3a3ec393769dd132a9a438778))


### Dependencies

* bump ignore-walk from 4.0.1 to 5.0.1 ([#87](https://github.com/npm/npm-packlist/issues/87)) ([0e241f5](https://github.com/npm/npm-packlist/commit/0e241f50e57b95274cd988e09763e205020c5b84))

## [4.0.0](https://www.github.com/npm/npm-packlist/compare/v3.0.0...v4.0.0) (2022-03-03)


### ⚠ BREAKING CHANGES

* This drops support for node10 and non-LTS versions of node12 and node14

### Bug Fixes

* always ignore pnpm-lock.yaml ([#72](https://www.github.com/npm/npm-packlist/issues/72)) ([f56a4cf](https://www.github.com/npm/npm-packlist/commit/f56a4cf77fbbb123f3c818777cf00555538e1c1c))


* @npmcli/template-oss@2.9.1 ([0401893](https://www.github.com/npm/npm-packlist/commit/04018939fc7ae6ceed1504a2fa4de44cfa049036))


### Dependencies

* update glob requirement from ^7.1.6 to ^7.2.0 ([#70](https://www.github.com/npm/npm-packlist/issues/70)) ([d6b34ac](https://www.github.com/npm/npm-packlist/commit/d6b34ac471215290f2198c5ad14c8eed8b203179))
* update npm-bundled requirement from ^1.1.1 to ^1.1.2 ([#71](https://www.github.com/npm/npm-packlist/issues/71)) ([2a5e140](https://www.github.com/npm/npm-packlist/commit/2a5e1402fb4617fc3791b2be405aa3bbb3181ff3))
