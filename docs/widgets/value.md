# Value

<!-- generated:start -->

A numeric or text KPI card.

**Value:** A number or a string.

## Properties

Every widget also has a set of [common properties](../protocol/messages#common-widget-properties) (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`), documented once on the message reference page — only `value`-specific properties are listed below.

| Property                         | Type             | Required | Description                                                                                   |
| -------------------------------- | ---------------- | -------- | --------------------------------------------------------------------------------------------- |
| <a id="prop-alarm"></a>`alarm`   | [number, number] | no       | `[low, high]` range. Values outside it are highlighted as an alarm (more severe than `warn`). |
| <a id="prop-minmax"></a>`minmax` | boolean          | no       | Shows the session's minimum and maximum observed values alongside the current one.            |
| <a id="prop-trend"></a>`trend`   | boolean          | no       | Shows an up/down/flat trend arrow based on the recent value history.                          |
| <a id="prop-warn"></a>`warn`     | [number, number] | no       | `[low, high]` range. Values outside it are highlighted as a warning.                          |

## Example

```json
@{"t":"w","id":"hum","k":"value","ch":"h","unit":"%","trend":true}
```

## Also the auto-discovery default

This is also the widget kind the app creates automatically for any channel with no `w` declaration at all, as soon as its value looks like a string — including one sent with nothing more than a plain `Serial.println`, no library and no protocol JSON required:

```cpp
Serial.println("status:\"Ready\"");
```

See [dashboard → auto-discovery](../guide/dashboard#auto-discovery) for the full set of default widgets (with a screenshot for each), and [Arduino Plotter compatibility](../guide/plotter-compat) for the complete text format this line is written in.

## Arduino library

`dash.value(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

From the widget's settings panel, this widget can be switched to: `line`, `gauge`, `level` — same value shape, no firmware change needed.

<!-- generated:end -->
