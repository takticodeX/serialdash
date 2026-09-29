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

## Arduino library

`dash.led(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

No other kind shares this one's value shape, so there's nothing to switch it to.

<!-- generated:end -->
