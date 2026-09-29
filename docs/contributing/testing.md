# Testing

## What exists today

| Command                        | What it checks                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm test`                     | Validates every vector in `/protocol/test-vectors/*.jsonl` against `/protocol/schema` (PRO-03), then runs the app's Vitest suite: `LineSplitter`, `Parser` (against the same PRO-03 vectors, at the app's own runtime classification level), `Encoder`, `ChannelStore`, `DeviceSession`, the dashboard layout algorithm, and widget/component smoke tests (QA-01). |
| `npm run gen:check`            | Regenerates `app/src/protocol/generated/*.ts`, `docs/protocol/messages.md`, and `docs/widgets/*.md`, then fails if anything changed but wasn't committed — keeps generated output aligned with the schema (PRO-02, DOC-03).                                                                                                                                        |
| `npx tsc -p app/tsconfig.json` | Typechecks the whole app.                                                                                                                                                                                                                                                                                                                                          |
| `npm run lint`                 | ESLint + Prettier across the repo.                                                                                                                                                                                                                                                                                                                                 |
| `npm run build -w app`         | Production build — also where lazy-loaded chunks (e.g. the gauge widget's ECharts bundle, SPEC.md §2.2) get verified to actually split out.                                                                                                                                                                                                                        |
| `npm run e2e`                  | Playwright suite (`app/e2e/`) driven entirely by `SimulatorTransport` — round-trip, rejection, timeout, and external update of a control (QA-03, SPEC.md §3.6). Starts its own dev server (`app/playwright.config.ts`'s `webServer`); no separate setup needed. Chromium only (APP-GEN-01).                                                                        |

## A jsdom limitation worth knowing

jsdom (Vitest's test environment) has no real `<canvas>` 2D context without the native `canvas` package, which this repo doesn't otherwise need. Widgets that paint to canvas (`line` via uPlot, `gauge` via ECharts) can't be rendered end-to-end in Vitest as a result — their pure logic (data transforms, demo generators) is unit-tested, but the actual paint is verified by running the app in a real browser against the simulator instead of by an automated jsdom test.

## Why the e2e suite matters, not just Vitest

`app/e2e/controls.spec.ts` (M4) caught a real bug no unit test could have: `react-grid-layout` treats a widget's entire card as a drag handle by default, which silently swallowed real mouse clicks on any button/input inside it (not a Playwright-only quirk — a real click generates the same mousedown→mouseup→click sequence). Fixed with `draggableCancel` on the grid (`app/src/dashboard/Grid.tsx`). Found by driving the actual UI, not by calling functions directly — the same reasoning that had M1-M3 verify important behavior in a real browser before committing.

## What's out of scope

Minimum 85% line coverage on `protocol`, `session`, `data` (QA-02) hasn't been measured yet — no coverage tooling is wired into `npm test` currently. An automated load test (originally QA-04) was explicitly descoped (SPEC.md §9.1) — the "Stress test" simulator scenario (APP-SIM-02) still exists for an occasional manual look, just with nothing automated asserting on it.

## Testing without hardware

Always develop and test against `SimulatorTransport` (SPEC.md §5.7) — it speaks protocol v1 exactly like a real board, including the handshake and widget declarations. Manual testing with real boards is the **release-time checklist below**, not part of the automated suite — when a feature needs hardware verification, say so explicitly instead of marking it tested.

## Manual release checklist

Run this on each of the 4 reference boards before publishing a release (SPEC.md §9.4): **Uno (CH340)**, **ESP32 (CP2102)**, **ESP32-S3 (native USB)**, **RP2040**. It's the last step before tagging — everything else (automated tests, docs, library metadata) should already be done and green.

For each board:

- [ ] **Driver/enumeration**: the board's port shows up in the browser's port picker without installing anything beyond the board's own OS driver (CH340/CP210x where applicable).
- [ ] **Connect, reset on**: flash [`02_FirstChart`](../library/examples#_02-firstchart), connect with "Reset the board on connect" checked. The chart appears and updates — no `rst:`/`waiting for download` text in the console (that would mean it booted into the bootloader instead of the sketch).
- [ ] **Connect, reset off**: reconnect with the option unchecked. Still works; console shows whatever the sketch printed since power-on (may be mid-stream, that's expected).
- [ ] **Physical reset while connected**: press the board's own reset button. The app notices the reconnect/reset marker; the sketch resumes running normally (not stuck in the bootloader — this is what regressed once already, see the app changelog).
- [ ] **Disconnect to upload**: click "Disconnect to upload a sketch", re-upload any example from the IDE, confirm it flashes fine with the port freed. If auto-reconnect is on, the app reconnects by itself once the new sketch boots.
- [ ] **Unplug/replug**: physically remove and reinsert the USB cable. With auto-reconnect on, the app reconnects without clicking Connect again.
- [ ] **Controls round-trip**: flash [`04_Controls`](../library/examples#_04-controls). The switch toggles the board's real LED; the slider snaps back when dragged past 200 and shows the clamped value; the button shows a rejection (with reason) while the switch is on, and succeeds once it's off (after confirming the dialog).
- [ ] **All widgets** (skip on Uno/Mega — not enough flash): flash [`05_AllWidgets`](../library/examples#_05-allwidgets), confirm every widget kind renders and the controls work.
- [ ] **Plotter compatibility**: flash a sketch that only calls `Serial.println("label:value")` — no SerialDash library at all — and confirm a chart auto-appears with correct values.

Record which boards/USB-serial chips were actually used (exact model, not just "an ESP32") in the release notes — "tested on 4 boards" is only meaningful if it's traceable to specific hardware later.
