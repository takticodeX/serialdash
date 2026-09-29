# Table

<!-- generated:start -->

A key-value table, highlighting changed rows.

**Value:** A label→value object, or one value per channel (multi-`ch`).

## Properties

Common properties every widget has (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`) are documented once in [the message reference](../protocol/messages) — only `table`-specific properties are listed below.

| Property | Type     | Required | Description |
| -------- | -------- | -------- | ----------- |
| `cols`   | string[] | no       |             |

## Example

```json
@{"t":"w","id":"status","k":"table","ch":"st"}
```

## Arduino library

`dash.table(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

No other kind shares this one's value shape, so there's nothing to switch it to.

<!-- generated:end -->
