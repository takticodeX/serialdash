# Value

<!-- generated:start -->

A numeric or text KPI card.

**Value:** A number or a string.

## Properties

Common properties every widget has (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`) are documented once in [the message reference](../protocol/messages) — only `value`-specific properties are listed below.

| Property | Type    | Required | Description |
| -------- | ------- | -------- | ----------- |
| `alarm`  | any[]   | no       |             |
| `minmax` | boolean | no       |             |
| `trend`  | boolean | no       |             |
| `warn`   | any[]   | no       |             |

## Example

```json
@{"t":"w","id":"hum","k":"value","ch":"h","unit":"%","trend":true}
```

## Arduino library

`dash.value(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

From the widget's settings panel (APP-DSH-05), this widget can be switched to: `line`, `gauge`, `level` — same value shape, no firmware change needed.

<!-- generated:end -->
