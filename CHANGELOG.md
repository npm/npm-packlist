# Changelog

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
