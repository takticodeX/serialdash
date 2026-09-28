# App changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioned independently from the protocol and the library (DOC-42).

## [Unreleased]

### Added

- **M1 — Console**: `WebSerialTransport` (connect/disconnect, DTR/RTS reset option, auto-reconnect,
  port-busy detection), a virtualized console (text, ANSI colors, hex view, search, send with
  history), PWA offline support, it/en i18n, light/dark/auto theme.
- **M2 — Protocol and base dashboard**: `LineSplitter`/`Parser`/`Encoder`, `DeviceSession` (`hi`
  handshake with retries, PRT-22 orphan tracking, auto-discovery), `ChannelStore` (ring buffer,
  device-clock offset), the 5 P0 display widgets (line/value/gauge/led/log), 12-column dashboard
  grid with groups/tabs and per-device persisted layout, `SimulatorTransport` ("All widgets"
  scenario), CSP-safe precompiled schema validators.
- **M4 — Bidirectional**: the 3 P0 control widgets (button/switch/slider) with the full
  pending/error/disabled state machine and rate-limited dragging (SPEC.md §3.6); `DeviceSession`
  now sends `ping` every 2s once handshaked, tracks ack latency and a "device not responding"
  indicator, and runs the full control command lifecycle (dispatch, timeout, merge pending
  updates); `SimulatorTransport` answers `hi`/`ping`/`c` for real, including a reject/clamp demo
  mirroring the library's own `onControl` example; first Playwright e2e suite
  (`app/e2e/controls.spec.ts`, QA-03) covering round-trip, rejection, timeout, and external
  update.
- **M5 — Full dashboard**: per-widget overrides (config panel wired to every widget's
  `ConfigPanel`, "reset to device value") and kind switching between value-compatible widgets
  (line/value/gauge/level, APP-DSH-05); user-created widgets bound to any known channel
  (`AddWidgetDialog`); per-widget toolbar (fullscreen, CSV export, value-widget stats reset);
  dashboard profile export/import (`.serialdash.json` — layout + overrides + user widgets) and a
  layout-lock toggle; the 10 P1 widgets — display: xy, bar, pie, level, table, heat; controls:
  number, select, text, color; auto-discovery extended to pair/array/object channel shapes
  (xy/bar/table); second Playwright e2e suite (`app/e2e/dashboard.spec.ts`, QA-03) covering
  override editing, kind switching, adding a widget, lock layout, and profile export/import.
- **M6 (partial — recording/replay and the load-test job deferred) — Plotter compatibility and
  simulator scenarios**: `PlotterFormat.parsePlotterLine` recognizes Arduino Serial Plotter–style
  plain text (`temp:23.4 hum:58`, `23.4,58`) and feeds it through the same auto-discovery path a
  real `d` message would take, while it stays visible in the console unchanged (APP-DAT-04);
  toggle in Settings, default on. `SimulatorTransport` gained 4 more scenarios besides
  "All widgets" (APP-SIM-02) — "Weather station" and "Motor control" (themed subsets of the same
  per-widget demo data), "Protocol errors" (real data interleaved with deliberately malformed
  lines), and "Stress test" (~1000 undeclared-channel lines/s, relying entirely on
  auto-discovery) — selectable from a new picker on the connect screen. 2 new Playwright e2e
  suites (`app/e2e/plotter.spec.ts`, `app/e2e/simulatorScenarios.spec.ts`).
- Line chart Min/Max: `LineWidgetConfigPanel` now exposes the fixed-range Min/Max fields
  `LineWidgetComponent` already supported but never had UI for — lets a channel that arrives with
  no widget declaration at all (Plotter-format or auto-discovered) get a fixed y-axis instead of
  staying auto-scaled forever. Clearing a field goes back to auto-scaling for that bound.
- SerialDash's logo (favicon, PWA icons, connect screen).

### Deviations

- M5: PNG export of a widget or the dashboard (APP-DSH-07) is deferred in full — none of the
  app's existing widgets have any screenshot capability, and adding one means a new rendering
  dependency; CSV export covers the same need for now. "Reset to device value" is whole-widget
  rather than per-property, since today's `ConfigPanel`s are too minimal (1-2 fields) for a
  per-field revert control to be proportionate.
- M6: recording/replay (APP-REC-01..04), the automated load-test job (QA-04), and the NFR-01..03
  performance verification it would gate are explicitly out of scope for this pass — by request,
  not an oversight. `docs/guide/recording.md` is still the M6-pending stub; the "Stress test"
  simulator scenario exists (APP-SIM-02) but nothing automated asserts on it yet.

### Fixed

- M4: `react-grid-layout`'s whole-card drag handle was silently swallowing real clicks on any
  button/input placed inside a widget (found via e2e, not just a Playwright artifact — a real
  mouse click generates the same event sequence). Fixed with `draggableCancel` in
  `app/src/dashboard/Grid.tsx`.
- M5 (found testing against real hardware, not just the simulator): opening a widget's settings
  panel before a lazy-loaded chunk (gauge/pie/heat) finished loading crashed the whole app to a
  blank page — `WidgetPanel`'s `ConfigPanel` now renders inside a `Suspense` boundary. A control
  widget added by hand (`AddWidgetDialog`) always got a fresh random `id`, but a control's `id`
  doubles as its state channel (PRT-13) — every hand-added control was unreachable ("unknown
  control") regardless of which channel was picked; it now reuses the picked channel as its `id`.
  The channel/control-id picker recomputed live on every incoming `d` message (a few times a
  second) while open, which most browsers handle badly (the dropdown stops responding to clicks);
  it's now snapshotted once when the dialog opens. `gauge`'s default size rendered as a squashed
  arc, not a circle — default height tripled.
- M6 (found testing a plain `Serial.println()` sketch with no SerialDash library, i.e. exactly
  the audience APP-DAT-04 targets): `PlotterFormat.parsePlotterLine` tokenized on every space,
  so `"temp: " + String(v)` (a space after the colon — a common real-world style the SPEC.md
  example itself doesn't have) split into `"temp:"` and the number as two separate tokens; since
  `Number('')` is `0`, not `NaN`, this silently produced `{temp: 0}` plus a spurious `ch0` holding
  the real value, instead of `{temp: <value>}`. Rewritten as a field-scanning parser that treats
  whitespace around the colon as part of the same field. `AddWidgetDialog`-created display
  widgets had no default `title`, so they showed their own meaningless random id on screen
  (`user-mn4h32n`); now defaults to the bound channel's name.
