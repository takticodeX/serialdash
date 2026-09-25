# Indicator

<!-- generated:start -->

A status LED for a boolean, numeric, or text value.

**Value:** A boolean, number, or string.

## Properties

Common properties every widget has (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`) are documented once in [the message reference](../protocol/messages) — only `led`-specific properties are listed below.

| Property | Type   | Required | Description       |
| -------- | ------ | -------- | ----------------- |
| `off`    | string | no       | Color as #RRGGBB. |
| `on`     | string | no       | Color as #RRGGBB. |
| `states` | object | no       |                   |

## Example

```json
@{"t":"w","id":"stato","k":"led","ch":"st","states":{"0":["Stopped","#888888"],"1":["Running","#2ecc71"]}}
```

<!-- generated:end -->

## Arduino library example

Arrives with the library (M3) — the builder method for `k: "led"`, and a runnable example sketch.

## Compatible templates for switching type

Arrives with dashboard overrides (M5, APP-DSH-05).
