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

<!-- generated:end -->

## Arduino library example

Arrives with the library (M3) — the builder method for `k: "line"`, and a runnable example sketch.

## Compatible templates for switching type

Arrives with dashboard overrides (M5, APP-DSH-05).
