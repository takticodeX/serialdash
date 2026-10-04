# Controls — bidirectional semantics

Controls (button, switch, slider, number, select, text, color) are the one place the protocol flows in both directions on the same id: the app sends a command, and the device decides what actually happens. This page documents that round trip in detail — the rules both the app and the Arduino library implement end to end. For the user-facing behavior, see [Controls](../guide/controls); for the library's `onControl` API, see [library reference](../library/api).

**The device is always the source of truth.** The app never shows a control as confirmed just because the user interacted with it — only once the device has said so. This avoids the classic "the UI lies" problem, where a switch looks on but isn't, because the command never actually reached the device, or the device refused it.

## The state machine

1. **Initial state.** A control declared with `w` can include `val`, its confirmed starting value — e.g. a switch that's already on when the dashboard connects. Without `val`, and with no `d` yet for that id, the control shows as "unknown" until one arrives.
2. **The user acts.** When the user flips the switch, drags the slider, picks a color, and so on, the app sends a `c` message with a fresh request id (`r`) and immediately shows the control in a **pending** state with the value the user picked — optimistic, but visibly provisional (e.g. a dashed border), since nothing is confirmed yet.
3. **The device responds.** The device evaluates the command and answers with `ack`, echoing the same `r` so the app knows which pending command it's answering. If it accepts (`ok:true`) and the value actually changed, the device also sends a `d` with the real resulting value — the Arduino library's `onControl` does this automatically unless the sketch opts out.
4. **The control settles.** Once that `d` arrives, the control shows the real value — which might not be exactly what the user requested (e.g. a slider clamped to a declared range). If the `ack` instead came back `ok:false`, the control reverts to its last confirmed value and shows the rejection reason (`err`) to the user.
5. **Timeout.** If no `ack` arrives within the configured window (1000 ms by default), the app gives up waiting, reverts the control, and shows "device not responding" — visually the same outcome as a rejection, but for a device that never answered at all rather than one that said no.
6. **Device-initiated changes.** The device can update a control's state at any time by sending a plain `d` on that same channel id — e.g. a physical button wired to the board toggles an LED, and the on-screen switch follows along without the user having touched anything.
7. **Rate limiting.** Continuous controls (slider, color) don't send a command on every pixel of movement — at most 20 per second while dragging, always followed by the final value on release. If the user changes a control again while a previous command is still pending, the new value replaces the queued one instead of firing a second command — only the latest value is sent, once the pending one resolves or times out.

## Example session

A switch named "fan", starting off, that the user turns on:

```
← @{"t":"w","id":"fan","k":"switch","title":"Fan","val":false}
→ @{"t":"c","r":1,"id":"fan","v":true}
← @{"t":"ack","r":1,"ok":true}
← @{"t":"d","d":{"fan":true}}
```

(`←` is the device sending, `→` is the app sending.) Line by line:

1. The device declares a `switch` widget with id `fan`, titled "Fan", and `val:false` — the dashboard shows it off from the moment it appears, with no command having been sent yet.
2. The user clicks the switch. The app sends `c` with a fresh request id (`r:1`) and `v:true`. The switch flips on screen right away, but in a pending state, since the device hasn't confirmed anything yet.
3. The device accepts the command (`ok:true`) and echoes `r:1`, so the app can match this response to the command it's waiting on.
4. The device reports the fan's actual new state via `d` — here, simply `true`, the value that was requested. The switch now shows as fully confirmed, not just pending, and the fan is genuinely on.

If the device's `onControl` handler had rejected the command instead — e.g. because some other condition made it unsafe to turn on the fan — step 3 would have been `@{"t":"ack","r":1,"ok":false,"err":"reason"}` and step 4 would never happen: the switch would revert to off and show the rejection reason to the user.

See `/protocol/test-vectors/` for every message shape involved, checked automatically against the schema.
