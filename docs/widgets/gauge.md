# Gauge

<!-- generated:start -->

A needle gauge with configurable color zones.

**Value:** A number.

## Properties

Common properties every widget has (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`) are documented once in [the message reference](../protocol/messages) — only `gauge`-specific properties are listed below.

| Property | Type    | Required | Description |
| -------- | ------- | -------- | ----------- |
| `max`    | number  | **yes**  |             |
| `min`    | number  | **yes**  |             |
| `zones`  | any[][] | no       |             |

## Example

```json
@{"t":"w","id":"g1","k":"gauge","ch":"h","min":0,"max":100,"zones":[[0,30,"#e67e22"],[30,70,"#2ecc71"],[70,100,"#3498db"]]}
```

## Arduino library

`dash.gauge(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

From the widget's settings panel (APP-DSH-05), this widget can be switched to: `line`, `value`, `level` — same value shape, no firmware change needed.

<!-- generated:end -->
