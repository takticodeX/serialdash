# Implementing the protocol yourself

You don't need the Arduino library to speak SerialDash — the wire format is plain JSON lines, usable from MicroPython, Rust, a desktop test harness, or anything else that can write to a serial port.

## What you need

1. **Framing**: emit `@` immediately followed by a JSON object, one per line, `\n`-terminated. See [overview](./overview) and SPEC.md §3.1.
2. **The schema**: `/protocol/schema/device-to-app.schema.json`, `/protocol/schema/app-to-device.schema.json`, and `/protocol/schema/widgets/*.schema.json` (JSON Schema, draft 2020-12) define every message and widget shape exactly. They are the normative source — SPEC.md §3 documents them in prose, but the schema wins if the two ever disagree (SPEC.md §3 header note).
3. **Test vectors**: `/protocol/test-vectors/*.jsonl` gives worked examples of valid and invalid lines in both directions, including edge cases (Unicode, escaping, extreme numbers, malformed JSON, truncated lines, invalid ids). Each line is `{"name", "dir": "d2a"|"a2d", "line": "@{...}", "valid": bool, "expect": ...}` — validate your own parser/encoder against these the same way `tools/validate-vectors` does for the reference implementation.

## Minimal device→app sequence

A device that only wants to appear in the console needs to send nothing at all — free text just works (principle P2). To get a dashboard, the minimum is:

```
@{"t":"hi","v":1,"name":"MyDevice"}
@{"t":"w","id":"t1","k":"value","ch":"t1"}
@{"t":"d","d":{"t1":23.4}}
```

## Constraints worth knowing before you start

- **App→device messages must be flat objects** — no nested objects or arrays in `c`/`hi`/`ping` (SPEC.md §3.4), so a microcontroller can use a trivial streaming parser.
- Widget and channel ids match `^[A-Za-z_][A-Za-z0-9_.-]{0,15}$` (PRT-11) and live in separate namespaces (PRT-12).
- Unknown message types and unknown fields on known messages must be **ignored**, not rejected (PRT-05, PRT-06) — this is what lets old and new implementations interoperate.
- `NaN`/`Infinity` don't exist in JSON: send `null` for a missing value (PRT-09).

## Validating against the schema in Node

```ts
import Ajv2020 from 'ajv/dist/2020.js';
// register protocol/schema/widgets/*.schema.json, then device-to-app.schema.json / app-to-device.schema.json
// — see tools/validate-vectors/src/schemas.ts for the exact setup.
```
