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
├── tools/                    # generation scripts (gen-types, validate-vectors, …)
└── .github/workflows/        # CI/CD
```

## Webapp stack (SPEC.md §2.2)

TypeScript (strict) · Vite · React 18 + Zustand · uPlot (time series) · Apache ECharts (gauge/pie/heatmap/…) · react-grid-layout · IndexedDB via `idb` · vite-plugin-pwa · i18next · Ajv (schema-compiled validation) · Vitest + Playwright.

Any new runtime dependency beyond this list needs to be justified in the commit that adds it.

## Webapp modules (SPEC.md §2.3)

```
app/src/
├── serial/        # WebSerialTransport: Web Serial, read/write, reconnection
├── transport/      # Transport interface + SimulatorTransport + ReplayTransport
├── protocol/       # LineSplitter, Parser, Encoder, Validator, generated types
├── session/        # DeviceSession: device state, handshake, pending commands
├── data/           # ChannelStore: per-channel ring buffer, stats
├── widgets/        # registry + one module per widget (display and controls)
├── dashboard/       # grid, groups/tabs, widget editor, user overrides
├── console/         # virtualized console, sending, history
├── recording/       # session recording and replay
├── storage/         # IndexedDB: profiles, layout, settings
├── i18n/            # it/en translations
└── ui/              # shared components, light/dark theme
```

## Data flow

```
Transport ──bytes──▶ LineSplitter ──lines──▶ Parser ─┬─▶ Console (text lines + errors)
    ▲                                                └─▶ DeviceSession ─▶ ChannelStore ─▶ Widgets (render at 30–60 fps)
    └──────────── Encoder ◀── commands from controls ◀───────────────────────────────────┘
```

`Transport` is an abstract interface with three implementations: `WebSerialTransport` (real hardware), `SimulatorTransport` (an in-browser virtual device), and `ReplayTransport` (replays a recording). Nothing above the transport layer knows which one is active — that's what makes the app fully testable without hardware.

## Where things stand (through M2)

The module tree above is fully wired end to end: `WebSerialTransport` and `SimulatorTransport` both feed the same `LineSplitter → Parser → DeviceSession → ChannelStore → Widgets` pipeline, and the dashboard renders the P0 display widgets (`line`, `value`, `gauge`, `led`, `log`) in a persisted, per-device grid. `recording/` and the control widgets' interactive half (`session`'s ack/timeout handling, the library) are the main pieces still to come — see SPEC.md §11 for what each milestone adds.
