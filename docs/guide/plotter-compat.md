# Arduino Plotter compatibility

SerialDash recognizes plain-text lines shaped like what the Arduino Serial Plotter expects, even from a sketch that doesn't use the SerialDash library at all. This is the fastest way to point SerialDash at an existing sketch you don't want to touch.

## Supported formats

- **Labeled**: `temp:23.4 hum:58` — space- or comma-separated `label:value` pairs. Each label becomes a channel id.
- **Bare numbers**: `23.4,58` — space- or comma-separated numbers with no label. Channels are named positionally: `ch0`, `ch1`, `ch2`, … in the order they appear on the line. A single bare number (`23.4`) works the same way, as `ch0`.
- The two forms can mix on one line: `temp:23.4 58` gives you `temp` and `ch0`.

A line only counts as Plotter data if **every** token on it parses this way — a device log line like `Error: sensor timeout` is left alone rather than misread as `{"Error": NaN}` plus garbage, since `sensor` isn't a number.

This exact subset — numbers only, nothing else — is what the real Arduino IDE's own Serial Plotter tool understands too, so a sketch written for it works unchanged in both places.

## Beyond the Plotter: typed values

SerialDash also recognizes a few more value shapes after the colon, which the real Arduino IDE Serial Plotter does **not** understand — a sketch using these only works in SerialDash, not in the IDE's own tool:

| You print                       | SerialDash sees                    | Auto-discovered widget |
| ------------------------------- | ---------------------------------- | ---------------------- |
| `temperature:24.99`             | a number                           | line chart             |
| `led:false`                     | a boolean (`true`/`false`)         | indicator              |
| `status:"heating"`              | a quoted string                    | value card             |
| `position:[-9.90,1.41]`         | an array of **exactly 2** numbers  | XY plot                |
| `spectrum:[55,26,11,20,47]`     | an array of numbers (≠ 2 elements) | bar chart              |
| `sensor:{"temp":22.8,"hum":53}` | a flat object of numbers/strings   | table                  |

Same rules as the widget catalog's own auto-discovery (see [dashboard → auto-discovery](dashboard#auto-discovery), which has a worked code example and screenshot for each of these). A few constraints keep this grammar simple and unambiguous:

- **Bare, unlabeled values stay numbers-only** — `23.4,58` always means two numeric channels, never a boolean or string. Only the `label:value` form accepts the extra types.
- **Arrays hold only numbers** — `[1,"a"]` isn't valid; mixed or non-numeric arrays are rejected.
- **Objects hold only numbers and strings** — `{"ok":true}` isn't valid (no booleans inside an object) and neither is a nested object or array value. This matches exactly what a real protocol `d` message is allowed to carry, so a channel built this way behaves identically to one driven by the library or by hand-written JSON.
- **No nesting anywhere** — an array can't contain another array or object, and neither can an object. One level only.

## Lines that look broken are reported, not silently dropped

A line that's clearly _attempting_ one of the typed forms above — a `label:` immediately followed by `"`, `[`, or `{` — but doesn't finish correctly (an unterminated string, a boolean inside an object, a non-numeric array element, nesting) is **not** treated as plain text. The first time this happens, SerialDash automatically adds a **"Plotter text errors"** widget to the dashboard (an ordinary `log` widget, in the "Auto" group) showing what was wrong and why, so you can fix the sketch without having to dig through the console.

Everything else that doesn't fit the grammar at all — ordinary debug text, a `label:` followed by something that isn't a number, string, array, object, or `true`/`false` — is left alone exactly as before: shown as plain console text, no widget, no warning. A line like `Connected, signal:5 bars` is never flagged just because it happens to contain something that looks like a field.

## What happens once a line is recognized

Recognized lines are fed through the exact same path a real `d` message would take: the values land in the matching channels, and a channel with no widget pointing at it gets one automatically (auto-discovery), exactly as described in [dashboard → auto-discovery](dashboard#auto-discovery). The line **also** stays visible in the console, unchanged — recognizing it as data never hides it.

## Turning it off

**Settings → "Recognize Arduino Serial Plotter–style text as data"**, on by default — this one setting covers both the plain numeric format and the typed extension above. Turn it off if your device happens to print debug lines that look like `label:value` by coincidence and you'd rather they stayed plain console text with no channel created for them.

::: info Scope note
SerialDash doesn't otherwise try to imitate the Arduino IDE's Serial Plotter — there's no plotter-specific chart type; recognized values render as ordinary auto-discovered widgets, same as any other channel.
:::
