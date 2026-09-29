# Line chart

<!-- generated:start -->

Real-time line chart for one or more numeric channels.

**Value:** One number per channel.

## Properties

Common properties every widget has (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`) are documented once in [the message reference](../protocol/messages) — only `line`-specific properties are listed below.

| Property | Type    | Required | Description                         |
| -------- | ------- | -------- | ----------------------------------- |
| `fill`   | boolean | no       |                                     |
| `max`    | number  | no       |                                     |
| `min`    | number  | no       |                                     |
| `step`   | boolean | no       |                                     |
| `win`    | number  | no       | Time window in seconds. Default 30. |

## Example

```json
@{"t":"w","id":"acc","k":"line","title":"Accelerometer","ch":["ax","ay","az"],"labels":["X","Y","Z"],"unit":"g","min":-2,"max":2,"win":10}
```

## Arduino library

`dash.line(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

From the widget's settings panel (APP-DSH-05), this widget can be switched to: `value`, `gauge`, `level` — same value shape, no firmware change needed.

<!-- generated:end -->
