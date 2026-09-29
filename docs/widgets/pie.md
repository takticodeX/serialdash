# Pie chart

<!-- generated:start -->

A pie or donut chart of labeled values.

**Value:** A label→number object.

## Properties

Common properties every widget has (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`) are documented once in [the message reference](../protocol/messages) — only `pie`-specific properties are listed below.

| Property | Type    | Required | Description |
| -------- | ------- | -------- | ----------- |
| `donut`  | boolean | no       |             |
| `pct`    | boolean | no       |             |

## Example

```json
@{"t":"w","id":"pwr","k":"pie","ch":"p","donut":true}
```

## Arduino library

`dash.pie(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

No other kind shares this one's value shape, so there's nothing to switch it to.

<!-- generated:end -->
