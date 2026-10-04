# Controls

Control widgets let the dashboard send commands back to the device — a button, a switch, a slider, a number field, a dropdown, a text field, or a color picker. All of them share the same interaction model; see [Controls — bidirectional semantics](../protocol/controls) for the full round trip at the protocol level.

## Sending a command

Interacting with a control (click, drag, type + Enter/blur) sends a `c` message to the device right away and shows the value you chose as **pending** — the widget dims slightly while it waits, rather than jumping back to the old value and then forward again once the device answers. When the device sends back its acknowledgement (`ack`):

- **ok** — the pending value becomes the confirmed one; the widget returns to normal.
- **not ok**, or no acknowledgement within the configured timeout (**Settings → Timeout risposta controlli**, `ackTimeoutMs`) — the widget shows an error state for a few seconds (hover to see the message, or "Device not responding" on timeout), then reverts to the last confirmed value.

If you interact with a control again while it's still pending, the new value replaces the pending one instead of firing off a second `c` — only one command per control is ever in flight.

## Disabled and offline

A control is disabled — greyed out, not interactive — whenever the device isn't connected, or when the device itself declared the widget with `dis: true` (e.g. a setpoint that only makes sense in a particular mode). This is a UI-only lock: it doesn't affect what the device does, just what you can click.

## Confirmation

A control declared with a `confirm` string (e.g. `"Are you sure?"`) shows a native confirm dialog before sending — useful for anything destructive like a reboot button. Cancelling the dialog leaves the control untouched; no message is sent.

## Every control kind

- **Button** — sends `true` on click. With `hold` set, it sends `true` on press and `false` on release instead, for a momentary/dead-man-switch action.
- **Switch** — a boolean toggle.
- **Slider** — a numeric range, sent on release (not on every intermediate drag position).
- **Number** — a numeric input, sent on Enter or on blur (not on every keystroke), respecting `min`/`max`/`step`.
- **Select** — a dropdown built from the widget's `opts` (plain strings, or `[value, label]` pairs when the wire value and the display label should differ).
- **Text** — a free-text input, sent on Enter, capped at `max` characters client-side (the device's own receive buffer is the hard limit).
- **Color** — a native color picker, plus one-click swatch buttons for any colors listed in `swatches`.

## Liveness

Independently of any control, the app pings a connected device every 2 seconds and shows **Device not responding** in the status bar if three pings in a row go unanswered — a hint that the device has hung or the serial link has died, even if no control is currently in use.
