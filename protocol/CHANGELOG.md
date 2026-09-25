# Protocol changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioned independently from the app and the library (DOC-42). Any protocol change requires updating SPEC.md §3, the JSON Schema, the test vectors, and this file (PRO-05).

## [1.0.0] - Unreleased (M0)

### Added

- Initial JSON Schema (draft 2020-12) for protocol v1, covering all device→app message types (`hi`, `w`, `u`, `x`, `d`, `e`, `ack`, `pong`), all app→device message types (`hi`, `c`, `ping`), and every widget in the catalog (SPEC.md §4).
