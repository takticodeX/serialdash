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

### Deviations

- M5: PNG export of a widget or the dashboard (APP-DSH-07) is deferred in full — none of the
  app's existing widgets have any screenshot capability, and adding one means a new rendering
  dependency; CSV export covers the same need for now. "Reset to device value" is whole-widget
  rather than per-property, since today's `ConfigPanel`s are too minimal (1-2 fields) for a
  per-field revert control to be proportionate.

### Fixed

- M4: `react-grid-layout`'s whole-card drag handle was silently swallowing real clicks on any
  button/input placed inside a widget (found via e2e, not just a Playwright artifact — a real
  mouse click generates the same event sequence). Fixed with `draggableCancel` in
  `app/src/dashboard/Grid.tsx`.
