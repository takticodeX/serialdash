# Protocol overview

SerialDash devices and the app exchange plain text lines over the serial connection. Only lines that opt into the protocol are structured; everything else is free text, so a plain `Serial.println` sketch keeps working exactly as it does in the classic Arduino Monitor (principle P2, SPEC.md §1.1).

## Framing

- Every message is **one line**, terminated by `\n` (`\r\n` is accepted, trailing `\r` ignored) — PRT-01.
- A protocol line starts with `@` immediately followed by a JSON object: `@{...}`, no space in between — PRT-02.
- Any line that doesn't start with `@{` is free text and goes straight to the console (or the library's `onText` callback) — PRT-03.
- A line that starts with `@{` but fails to parse, or fails schema validation, is **not** silently dropped: the app shows it in the console as a protocol error with the reason — PRT-04.

## Channels vs. widgets

These are two separate namespaces (PRT-12):

- A **channel** is just a named value stream — `d` messages report `channel → value`. A channel needs no prior declaration; an undeclared channel triggers auto-discovery (§5.4 in SPEC.md, arriving in M2).
- A **widget** is a piece of UI (`w` messages declare `id`, `k` kind, and display options). A widget usually points at one or more channels via `ch`, except controls, where the widget `id` doubles as the channel id for its own state (PRT-13).

This separation is why the same device can send raw data with zero setup (P3 — zero configuration possible) and later gain a fully laid-out dashboard just by adding `w` declarations, without changing how data is sent.

## Handshake

1. The app requests a `hi` (`@{"t":"hi","v":1}`) shortly after connecting.
2. The device answers with its own `hi` (name, firmware version, board, receive buffer size), followed by all its widget declarations (`w`).
3. If no `hi` arrives after three attempts, the session continues in plain **text mode**: console and auto-discovery still work, just without a curated dashboard (P2).
4. A `ping`/`pong` exchange every 2s afterwards measures latency and lets the device know the app is listening.

Full rules: SPEC.md §3.5. Full message shapes: [message reference](./messages) (generated from the schema) and `/protocol/schema/*.schema.json`.

## Where the schema lives

`/protocol/schema/` is the single source of truth (SPEC.md §7, PRO-01): `device-to-app.schema.json`, `app-to-device.schema.json`, and one file per widget kind under `widgets/`. TypeScript types for the app are generated from it by `npm run gen` — see [implementing the protocol](./implementing) if you're writing a client in another language.
