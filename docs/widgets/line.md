# Line chart

<!-- generated:start -->

Real-time line chart for one or more numeric channels.

**Value:** One number per channel.

## Properties

Every widget also has a set of [common properties](../protocol/messages#common-widget-properties) (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`), documented once on the message reference page — only `line`-specific properties are listed below.

| Property                     | Type    | Required | Description                                                              |
| ---------------------------- | ------- | -------- | ------------------------------------------------------------------------ |
| <a id="prop-fill"></a>`fill` | boolean | no       | Fills the area under the curve.                                          |
| <a id="prop-max"></a>`max`   | number  | no       | Fixed Y-axis maximum. Omit (along with `min`) to auto-scale to the data. |
| <a id="prop-min"></a>`min`   | number  | no       | Fixed Y-axis minimum. Omit (along with `max`) to auto-scale to the data. |
| <a id="prop-step"></a>`step` | boolean | no       | Draws steps between points instead of straight connecting lines.         |
| <a id="prop-win"></a>`win`   | number  | no       | Time window shown, in seconds. Default 30.                               |

## Example

```json
@{"t":"w","id":"acc","k":"line","title":"Accelerometer","ch":["ax","ay","az"],"labels":["X","Y","Z"],"unit":"g","min":-2,"max":2,"win":10}
```

## Also the auto-discovery default

This is also the widget kind the app creates automatically for any channel with no `w` declaration at all, as soon as its value looks like a number — including one sent with nothing more than a plain `Serial.println`, no library and no protocol JSON required:

```cpp
Serial.println("temp:23.4");
```

See [dashboard → auto-discovery](../guide/dashboard#auto-discovery) for the full set of default widgets (with a screenshot for each), and [Arduino Plotter compatibility](../guide/plotter-compat) for the complete text format this line is written in.

## Arduino library

`dash.line(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

From the widget's settings panel, this widget can be switched to: `value`, `gauge`, `level` — same value shape, no firmware change needed.

<!-- generated:end -->
