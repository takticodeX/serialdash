# Testing

## What exists today (M0)

| Command                        | What it checks                                                                                                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                     | Validates every vector in `/protocol/test-vectors/*.jsonl` against `/protocol/schema` with Ajv — PRO-03. Run by `tools/validate-vectors` (Vitest).                                                                        |
| `npm run gen:check`            | Regenerates `app/src/protocol/generated/*.ts` and the `docs/protocol/messages.md` generated block, then fails if anything changed but wasn't committed — keeps generated output aligned with the schema (PRO-02, DOC-03). |
| `npx tsc -p app/tsconfig.json` | Confirms the generated protocol types compile.                                                                                                                                                                            |
| `npm run lint`                 | ESLint + Prettier across the repo.                                                                                                                                                                                        |

## What arrives later

Per SPEC.md §9, as the corresponding code lands:

- **M2**: Vitest unit tests for `LineSplitter`, `Parser`, `Encoder`, `ChannelStore`, `DeviceSession` — always against `SimulatorTransport`, never real hardware (QA-01). Minimum 85% line coverage on `protocol`, `session`, `data` (QA-02).
- **M2+**: Playwright e2e tests driven by the simulator (QA-03), and the load-test scenario (QA-04, M6).
- **M3**: Native PlatformIO tests for the Arduino library parser/encoder (QA-10), each output line additionally validated against the JSON Schema (QA-11), plus `arduino-cli compile` across all supported boards (QA-12) and `arduino-lint` (QA-13).

## Testing without hardware

Always develop and test against `SimulatorTransport` (SPEC.md §5.7) — it speaks protocol v1 exactly like a real board, including handshake, resets, and rejected commands. Manual testing with real boards (Uno/CH340, ESP32/CP2102, ESP32-S3 native USB, RP2040) is a release-time checklist, not part of the automated suite — when a feature needs hardware verification, say so explicitly instead of marking it tested.
