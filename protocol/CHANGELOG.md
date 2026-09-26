# Protocol changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioned independently from the app and the library (DOC-42). Any protocol change requires updating SPEC.md §3, the JSON Schema, the test vectors, and this file (PRO-05).

## [1.0.0] - Unreleased (M0)

### Added

- Initial JSON Schema (draft 2020-12) for protocol v1, covering all device→app message types (`hi`, `w`, `u`, `x`, `d`, `e`, `ack`, `pong`), all app→device message types (`hi`, `c`, `ping`), and every widget in the catalog (SPEC.md §4).

### Fixed

- `controlExtras.val` had no `type` constraint, so it validated (and generated a TypeScript type of) literally anything, including objects and arrays — never noticed until M4 needed to actually read it, since M0–M3 only declared/displayed controls, never their confirmed value. Narrowed to `["number", "boolean", "string"]`, matching §3.6.1's "type depends on the control" and the `ControlValue` type controls have used since M2's Encoder. Not a behavior change (no control ever legitimately sent anything else) — existing `val` examples in the test vectors (`widget-switch`, `widget-slider`, `widget-select`) already fit the narrower type.
