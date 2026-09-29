# Heatmap

<!-- generated:start -->

A rows x cols color-mapped matrix.

**Value:** A flat array of `rows` × `cols` numbers, row-major.

## Properties

Common properties every widget has (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`) are documented once in [the message reference](../protocol/messages) — only `heat`-specific properties are listed below.

| Property  | Type                                   | Required | Description |
| --------- | -------------------------------------- | -------- | ----------- |
| `cols`    | integer                                | **yes**  |             |
| `interp`  | boolean                                | no       |             |
| `max`     | number                                 | no       |             |
| `min`     | number                                 | no       |             |
| `palette` | `"thermal"` \| `"viridis"` \| `"gray"` | no       |             |
| `rows`    | integer                                | **yes**  |             |

## Example

```json
@{"t":"w","id":"grid","k":"heat","ch":"g","rows":4,"cols":4,"min":15,"max":35,"palette":"thermal"}
```

## Arduino library

`dash.heat(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

No other kind shares this one's value shape, so there's nothing to switch it to.

<!-- generated:end -->
