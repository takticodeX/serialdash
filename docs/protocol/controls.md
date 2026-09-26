# Controls — bidirectional semantics

::: info
This page documents the protocol semantics (SPEC.md §3.6), which are fixed as of v1 and already encoded in `/protocol/schema`. Both sides now implement it end to end: the app's pending/error UI states and rate limiting, and the library's receive parser and `onControl` API (**M4**, SPEC.md §11) — a polished guide with screenshots lands in **M5** alongside the rest of `dashboard.md`/`controls.md`'s user-facing writeup.
:::

The guiding rule (principle P4): **the device is the source of truth**. The app never shows a control as confirmed unless the device said so.

1. A control declared with `w` treats `val` (if present) as the **confirmed state**. From then on it tracks the latest value on the channel with the same id (PRT-13). With neither `val` nor a `d` for that id, the control shows an "unknown" state.
2. When the user acts on a control, the app sends `c` with a fresh `r` and puts the control in a **pending** state, showing the value the user picked.
3. The device executes the command and answers with `ack`. If `ok:true` and the value was applied, the device also sends the actual resulting state via `d` (the Arduino library does this automatically — see [library API](../library/api)).
4. On receiving that `d`, the control settles on the real value (which may differ from what was requested, e.g. if it was clamped). On `ack` with `ok:false`, the control reverts to the last confirmed value and shows `err` in a tooltip/toast.
5. **Timeout**: no `ack` within 1000 ms (configurable) reverts the control and shows "device not responding".
6. The device can change a control's state at any time by sending `d` — e.g. a physical button toggles an LED, and the UI switch follows along.
7. **Rate limiting**: continuous controls (slider, color) send at most 20 commands/s while dragging, and always the final value on release. While a command is pending, later ones from the same control coalesce into one (only the latest is sent once the pending `ack` resolves or times out).

## Example session

```
← @{"t":"w","id":"fan","k":"switch","title":"Fan","val":false}
→ @{"t":"c","r":1,"id":"fan","v":true}
← @{"t":"ack","r":1,"ok":true}
← @{"t":"d","d":{"fan":true}}
```

(`←` from the device, `→` from the app.) See `/protocol/test-vectors/` for machine-checked examples of every message shape involved.
