# Level bar

<!-- generated:start -->

A horizontal or vertical fill/progress bar.

**Value:** A number.

## Properties

Common properties every widget has (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`) are documented once in [the message reference](../protocol/messages) — only `level`-specific properties are listed below.

| Property | Type    | Required | Description |
| -------- | ------- | -------- | ----------- |
| `max`    | number  | no       |             |
| `min`    | number  | no       |             |
| `vert`   | boolean | no       |             |
| `zones`  | any[][] | no       |             |

## Example

```json
@{"t":"w","id":"tank","k":"level","ch":"lvl","min":0,"max":100,"unit":"%","zones":[[0,20,"#e74c3c"],[20,100,"#2ecc71"]]}
```

## Arduino library

`dash.level(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

From the widget's settings panel (APP-DSH-05), this widget can be switched to: `line`, `value`, `gauge` — same value shape, no firmware change needed.

<!-- generated:end -->
