# Architecture

Summary of SPEC.md §2 — read the spec for the normative version.

## Repository layout

```
serialdash/
├── protocol/
│   ├── schema/               # JSON Schema v1 — the single source of truth for the protocol
│   └── test-vectors/         # shared .jsonl fixtures (app parser + library parser)
├── app/                      # webapp (TypeScript, Vite, React)
├── lib/SerialDash/           # Arduino/PlatformIO library
├── docs/                     # this site (VitePress)
├── tools/                    # generation scripts (gen-types, gen-docs, validate-vectors, …)
└── .github/workflows/        # CI/CD
```

## Webapp stack (SPEC.md §2.2)

TypeScript (strict) · Vite · React 18 + Zustand · uPlot (time series) · Apache ECharts (gauge/pie/heatmap) · react-grid-layout · IndexedDB via `idb` · vite-plugin-pwa · i18next · Ajv (schema-compiled validation) · Vitest + Playwright.

Any new runtime dependency beyond this list needs to be justified in the commit that adds it.

## Webapp modules (SPEC.md §2.3)

```
app/src/
├── connection/     # ConnectScreen, UnsupportedBrowser — the pre-session screens
├── serial/         # WebSerialTransport, connection store, port reset signals, hotplug
├── transport/      # Transport interface + SimulatorTransport (5 scenarios, APP-SIM-02)
├── protocol/       # LineSplitter, Parser, Encoder, Validator, PlotterFormat, generated types
├── session/        # DeviceSession: device state, handshake, ping/liveness, pending commands
├── data/           # ChannelStore: per-channel ring buffer, stats
├── widgets/        # registry + one module per widget kind (18: P0/P1 display and controls)
├── dashboard/      # grid, groups/tabs, widget editor, user overrides, profile export/import
├── console/        # virtualized console, sending, history
├── settings/       # persisted app settings (autoDiscovery, plotterCompat, ackTimeoutMs, …)
├── storage/        # IndexedDB: profiles, layout, settings
├── i18n/           # it/en translations
├── assets/         # static assets bundled into the app (e.g. the logo)
└── ui/             # shared components, light/dark theme
```

## Data flow

```
Transport ──bytes──▶ LineSplitter ──lines──▶ Parser ─┬─▶ Console (text lines + errors)
    ▲                                                ├─▶ PlotterFormat (if text, APP-DAT-04) ──▶ DeviceSession
    │                                                └─▶ DeviceSession ─▶ ChannelStore ─▶ Widgets (render at 30–60 fps)
    └──────────── Encoder ◀── commands from controls ◀───────────────────────────────────┘
```

`Transport` is an abstract interface with two implementations: `WebSerialTransport` (real hardware) and `SimulatorTransport` (an in-browser virtual device, 5 selectable scenarios). Nothing above the transport layer knows which one is active — that's what makes the app fully testable without hardware (ADR-001).

## Where things stand (through M6)

The full pipeline is wired end to end and has been since M2. Since then:

- **M3/M4**: the Arduino/ESP32 library (`lib/SerialDash/`) can declare every widget kind and drive the receive path (controls, `onControl`/`onAnyControl`, automatic ack + echo).
- **M5**: per-widget overrides and kind switching, user-created widgets, profile export/import, and the remaining 13 P1 widgets (all 18 kinds are implemented app-side now).
- **M6**: Arduino Serial Plotter–style plain text is recognized as data even without the library (`PlotterFormat`); the simulator gained 4 more scenarios besides "All widgets".

Recording/replay and an automated load-test job were both explicitly descoped (SPEC.md §5.6, §9.1 QA-04) — not part of the plan. See SPEC.md §11 for the full milestone table and what M7 (release 1.0) still needs.
