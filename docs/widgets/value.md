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

<!-- generated:end -->

## Arduino library example

Arrives with the library (M3) — the builder method for `k: "value"`, and a runnable example sketch.

## Compatible templates for switching type

Arrives with dashboard overrides (M5, APP-DSH-05).
