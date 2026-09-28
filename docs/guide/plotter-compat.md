# Arduino Plotter compatibility

SerialDash recognizes plain-text lines shaped like what the Arduino Serial Plotter expects, even from a sketch that doesn't use the SerialDash library at all. This is the fastest way to point SerialDash at an existing sketch you don't want to touch.

## Supported formats

- **Labeled**: `temp:23.4 hum:58` — space- or comma-separated `label:value` pairs. Each label becomes a channel id.
- **Bare numbers**: `23.4,58` — space- or comma-separated numbers with no label. Channels are named positionally: `ch0`, `ch1`, `ch2`, … in the order they appear on the line. A single bare number (`23.4`) works the same way, as `ch0`.
- The two forms can mix on one line: `temp:23.4 58` gives you `temp` and `ch0`.

A line only counts as Plotter data if **every** token on it parses this way — a device log line like `Error: sensor timeout` is left alone rather than misread as `{"Error": NaN}` plus garbage, since `sensor` isn't a number.

## What happens once a line is recognized

Recognized lines are fed through the exact same path a real `d` message would take: the values land in the matching channels, and a channel with no widget pointing at it gets one automatically (auto-discovery), exactly as described in [dashboard → auto-discovery](dashboard#auto-discovery). The line **also** stays visible in the console, unchanged — recognizing it as data never hides it.

## Turning it off

**Settings → "Recognize Arduino Serial Plotter–style text as data"**, on by default. Turn it off if your device happens to print debug lines that look like `label:value` by coincidence and you'd rather they stayed plain console text with no channel created for them.

::: info Scope note
This only recognizes the wire format — SerialDash doesn't otherwise try to imitate the Arduino IDE's Serial Plotter (no plotter-specific chart type; the recognized values render as ordinary auto-discovered widgets, same as any other channel).
:::
