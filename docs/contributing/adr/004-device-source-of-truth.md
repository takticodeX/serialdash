# ADR-004: The device is the source of truth for control state

## Context

Bidirectional controls (switches, sliders, …) create a classic distributed-state problem: the app shows a value, the user changes it, and the device may accept, clamp, reject, or ignore the change — potentially with real-world latency (a motor spinning up, a relay debouncing). Showing the user's requested value as if it were confirmed would lie about the device's actual state.

## Decision

The device is always the authority on a control's real state (principle P4). The app never renders an unconfirmed value as if it were real: a user action shows a distinct **pending** state until the device replies, and the control only settles once the device confirms via `ack` + `d` (SPEC.md §3.6).

## Consequences

- Every control has four visual states — normal, pending, error, disabled (SPEC.md §4.3) — which the UI must implement consistently, not just for controls that happen to be slow.
- The Arduino library encodes this by design: a successful `onControl` callback must send back the _actual_ applied value via `v.set()`, and the library auto-echoes it as `d` (LIB-CTL-03/04) — firmware can't opt out of reporting truth without disabling auto-echo explicitly.
- A physical control on the device (e.g. a button wired directly to a pin) can change state at any time by sending `d`, and the UI just follows along (SPEC.md §3.6 rule 6) — the app never assumes it's the only writer.
- This costs a small amount of perceived latency (the UI doesn't snap instantly) in exchange for never showing a lie.
