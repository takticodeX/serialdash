# Indicator

<!-- generated:start -->

A status LED for a boolean, numeric, or text value.

**Value:** A boolean, number, or string.

## Properties

Every widget also has a set of [common properties](../protocol/messages#common-widget-properties) (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`), documented once on the message reference page — only `led`-specific properties are listed below.

| Property                         | Type   | Required | Description                                                                                                                                                                                     |
| -------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="prop-off"></a>`off`       | string | no       | Color (#RRGGBB) shown when the channel's value is falsy.                                                                                                                                        |
| <a id="prop-on"></a>`on`         | string | no       | Color (#RRGGBB) shown when the channel's value is truthy (nonzero number, `true`, or a string other than empty/"false"/"0").                                                                    |
| <a id="prop-states"></a>`states` | object | no       | Maps a specific raw value to its own `[label, color]` — for more than two states (e.g. a 3-way mode channel). An entry here takes precedence over `on`/`off` when the current value matches it. |

## Example

```json
@{"t":"w","id":"stato","k":"led","ch":"st","states":{"0":["Stopped","#888888"],"1":["Running","#2ecc71"]}}
```

## Also the auto-discovery default

This is also the widget kind the app creates automatically for any channel with no `w` declaration at all, as soon as its value looks like a boolean — including one sent with nothing more than a plain `Serial.println`, no library and no protocol JSON required:

```cpp
Serial.println("pump:true");
```

See [dashboard → auto-discovery](../guide/dashboard#auto-discovery) for the full set of default widgets (with a screenshot for each), and [Arduino Plotter compatibility](../guide/plotter-compat) for the complete text format this line is written in.

## Arduino library

`dash.led(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

No other kind shares this one's value shape, so there's nothing to switch it to.

<!-- generated:end -->
