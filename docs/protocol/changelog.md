# Protocol changelog

Versioned independently from the app and the library. The canonical file is [`/protocol/CHANGELOG.md`](https://github.com/takticodeX/serialdash/blob/main/protocol/CHANGELOG.md) in the repository; this page mirrors it for the published site.

## [1.0.0] - Unreleased

### Added

- Initial JSON Schema for protocol v1: all device→app message types (`hi`, `w`, `u`, `x`, `d`, `e`, `ack`, `pong`), all app→device message types (`hi`, `c`, `ping`), and every widget in the catalog.

### Fixed

- `controlExtras.val` (a control's initial/confirmed value) had no `type` constraint, so it validated — and generated a TypeScript type of — literally anything, including objects and arrays. Narrowed to `["number", "boolean", "string"]`, matching every control's actual value type. Not a behavior change: no control ever legitimately sent anything else, and the existing test vectors already fit the narrower type.
