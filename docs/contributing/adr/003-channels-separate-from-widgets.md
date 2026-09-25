# ADR-003: Channels are separate from widgets

## Context

Principle P3 requires "zero configuration possible": a device that just calls `Serial.println` or sends raw `d` data with no `w` declarations at all must still show up usefully in the app (auto-discovery, APP-DAT-03). At the same time, a device that wants a curated dashboard needs to declare rich widgets, retarget which channels feed them, and let the user override display choices without touching firmware.

## Decision

Model **channels** (named value streams, referenced in `d` messages) and **widgets** (UI elements, declared with `w`) as two separate namespaces (PRT-12) connected by the widget's `ch` field. A channel needs no declaration to exist; a widget always needs one.

Controls are the one exception: a control's `id` doubles as the id of its own state channel (PRT-13), since a control both displays and produces a single value.

## Consequences

- Data can start flowing, and be auto-visualized, before any widget exists — this is what makes zero-configuration mode possible (APP-DAT-03).
- The same channel can feed multiple widgets, and a widget can be retargeted to different channels from the UI (APP-DSH-06) without the device knowing.
- A widget and a channel can share the same id string without colliding, since they live in different namespaces (PRT-12) — e.g. a widget `temp` and a channel `temp` can coexist (SPEC.md §3.2).
- The trade-off: this indirection is one extra concept for firmware authors to learn, mitigated by the library's builder API making `ch(...)` read naturally (LIB-TX-02).
