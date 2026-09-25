# Protocol changelog

Versioned independently from the app and the library (DOC-42). The canonical file is [`/protocol/CHANGELOG.md`](https://github.com/serialdash/serialdash/blob/main/protocol/CHANGELOG.md) in the repository; this page mirrors it for the published site.

## [1.0.0] - Unreleased (M0)

### Added

- Initial JSON Schema (draft 2020-12) for protocol v1: all device→app message types (`hi`, `w`, `u`, `x`, `d`, `e`, `ack`, `pong`), all app→device message types (`hi`, `c`, `ping`), and every widget in the catalog (SPEC.md §4).
