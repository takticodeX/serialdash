# Testing

## What exists today

| Command                        | What it checks                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm test`                     | Validates every vector in `/protocol/test-vectors/*.jsonl` against `/protocol/schema` (PRO-03), then runs the app's Vitest suite: `LineSplitter`, `Parser` (against the same PRO-03 vectors, at the app's own runtime classification level), `Encoder`, `ChannelStore`, `DeviceSession`, the dashboard layout algorithm, and widget/component smoke tests (QA-01). |
| `npm run gen:check`            | Regenerates `app/src/protocol/generated/*.ts`, `docs/protocol/messages.md`, and `docs/widgets/*.md`, then fails if anything changed but wasn't committed — keeps generated output aligned with the schema (PRO-02, DOC-03).                                                                                                                                        |
| `npx tsc -p app/tsconfig.json` | Typechecks the whole app.                                                                                                                                                                                                                                                                                                                                          |
| `npm run lint`                 | ESLint + Prettier across the repo.                                                                                                                                                                                                                                                                                                                                 |
| `npm run build -w app`         | Production build — also where lazy-loaded chunks (e.g. the gauge widget's ECharts bundle, SPEC.md §2.2) get verified to actually split out.                                                                                                                                                                                                                        |

## A jsdom limitation worth knowing

jsdom (Vitest's test environment) has no real `<canvas>` 2D context without the native `canvas` package, which this repo doesn't otherwise need. Widgets that paint to canvas (`line` via uPlot, `gauge` via ECharts) can't be rendered end-to-end in Vitest as a result — their pure logic (data transforms, demo generators) is unit-tested, but the actual paint is verified by running the app in a real browser against the simulator instead of by an automated jsdom test.

## What arrives later

Per SPEC.md §9, as the corresponding code lands:

- **M2+**: A permanent Playwright e2e suite driven by the simulator (QA-03) — M2 verified the "All widgets" scenario by running the app in a real browser rather than committing a Playwright harness; a lasting suite is still open. The load-test scenario (QA-04) needs the stress-test simulator scenario from M6.
- **M3**: Native PlatformIO tests for the Arduino library parser/encoder (QA-10), each output line additionally validated against the JSON Schema (QA-11), plus `arduino-cli compile` across all supported boards (QA-12) and `arduino-lint` (QA-13).
- Minimum 85% line coverage on `protocol`, `session`, `data` (QA-02) hasn't been measured yet — no coverage tooling is wired into `npm test` currently.

## Testing without hardware

Always develop and test against `SimulatorTransport` (SPEC.md §5.7) — it speaks protocol v1 exactly like a real board, including the handshake and widget declarations. Manual testing with real boards (Uno/CH340, ESP32/CP2102, ESP32-S3 native USB, RP2040) is a release-time checklist, not part of the automated suite — when a feature needs hardware verification, say so explicitly instead of marking it tested.
