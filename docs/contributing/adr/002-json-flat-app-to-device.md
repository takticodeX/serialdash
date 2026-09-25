# ADR-002: JSON in both directions, but app→device messages are flat

## Context

The protocol needs to be easy to generate from a microcontroller with as little as 2 KB of RAM (Arduino Uno, principle P5) and no dynamic allocation (LIB-GEN-05), while still being expressive enough for rich widget declarations coming the other way, and trivially debuggable by a human reading the console.

## Decision

Use JSON for both directions (`@{...}` framing, SPEC.md §3.1), but constrain app→device messages (`hi`, `c`, `ping`) to **flat objects only** — no nested objects or arrays as values (SPEC.md §3.4). Device→app messages (`w`, `d`, …) have no such restriction, since the app runs on a real computer and can use a full JSON parser.

## Consequences

- The Arduino library's receive-side parser can be a minimal, allocation-free streaming parser (LIB-RX-02/03) instead of a general JSON library — this is also why SerialDash ships no ArduinoJson dependency (LIB-GEN-06).
- App→device field order is additionally fixed (`t`, `r`, `id`, `v` — PRT-40) so the library parser can optionally rely on it, though it must not require it (PRT-40 note).
- A future joystick/2D control (open decision D3, SPEC.md §10) can't use a nested value and is instead proposed as a flat array of up to 4 numbers if it ships.
- Everything is still human-readable in the console, which matters for debugging over a raw serial terminal.
