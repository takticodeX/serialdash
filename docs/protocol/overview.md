# Protocol overview

SerialDash devices and the app exchange plain text lines over the serial connection. Only lines that opt into the protocol are structured; everything else is free text, so a plain `Serial.println` sketch keeps working exactly as it does in the classic Arduino Serial Monitor.

## Framing

- Every message is **one line**, terminated by `\n` (`\r\n` is accepted, the trailing `\r` is ignored).
- A protocol line starts with `@` immediately followed by a JSON object: `@{...}`, no space in between.
- Any line that doesn't start with `@{` is free text and goes straight to the console (or the library's `onText` callback).
- A line that starts with `@{` but fails to parse, or fails schema validation, is **not** silently dropped: the app shows it in the console as a protocol error with the reason.

## Channels vs. widgets

These are two separate namespaces:

- A **channel** is just a named value stream — `d` messages report `channel → value`. A channel needs no prior declaration; an undeclared channel can auto-create a widget for itself, depending on the app's settings.
- A **widget** is a piece of UI (`w` messages declare `id`, `k` kind, and display options). A widget usually points at one or more channels via `ch`, except controls, where the widget's own `id` doubles as the channel id for its state.

This separation is why the same device can send raw data with zero setup — no library, no declarations, just `Serial.println` — and later gain a fully laid-out dashboard just by adding `w` declarations, without changing how data is sent.

## Handshake

1. The app requests a `hi` (`@{"t":"hi","v":1}`) shortly after connecting.
2. The device answers with its own `hi` (name, firmware version, board, receive buffer size), followed by all its widget declarations (`w`).
3. If no `hi` arrives after three attempts, the session continues in plain **text mode**: console and auto-discovery still work, just without a curated dashboard.
4. A `ping`/`pong` exchange every 2 seconds afterwards measures latency and lets the device know the app is listening.

Full message shapes: [message reference](./messages) (generated from the schema) and `/protocol/schema/*.schema.json`.

## Where the schema lives

`/protocol/schema/` is the single source of truth: `device-to-app.schema.json`, `app-to-device.schema.json`, and one file per widget kind under `widgets/`. TypeScript types for the app are generated from it by `npm run gen` — see [implementing the protocol](./implementing) if you're writing a client in another language.
