# Protocol changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioned independently from the app and the library — a protocol-only change doesn't bump the app's or library's own version, and vice versa.

## [1.0.0] - Unreleased

### Added

- Initial JSON Schema for protocol v1, covering all device→app message types (`hi`, `w`, `u`, `x`, `d`, `e`, `ack`, `pong`), all app→device message types (`hi`, `c`, `ping`), and every widget in the catalog.

### Fixed

- `controlExtras.val` (a control's initial/confirmed value) had no `type` constraint, so it validated — and generated a TypeScript type of — literally anything, including objects and arrays. Narrowed to `["number", "boolean", "string"]`, matching every control's actual value type and the `ControlValue` type the app's encoder already used. Not a behavior change: no control ever legitimately sent anything else, and the existing test vectors already fit the narrower type.
