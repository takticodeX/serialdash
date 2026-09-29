# XY plot

<!-- generated:start -->

A scatter or line plot of [x, y] pairs.

**Value:** An `[x, y]` pair.

## Properties

Common properties every widget has (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`) are documented once in [the message reference](../protocol/messages) — only `xy`-specific properties are listed below.

| Property | Type                    | Required | Description               |
| -------- | ----------------------- | -------- | ------------------------- |
| `mode`   | `"points"` \| `"lines"` | no       |                           |
| `trail`  | integer                 | no       | Points kept. Default 500. |
| `xlabel` | string                  | no       |                           |
| `xmax`   | number                  | no       |                           |
| `xmin`   | number                  | no       |                           |
| `ylabel` | string                  | no       |                           |
| `ymax`   | number                  | no       |                           |
| `ymin`   | number                  | no       |                           |

## Example

```json
@{"t":"w","id":"pos","k":"xy","ch":"p","xmin":-1.2,"xmax":1.2,"ymin":-1.2,"ymax":1.2,"mode":"lines"}
```

## Arduino library

`dash.xy(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

No other kind shares this one's value shape, so there's nothing to switch it to.

<!-- generated:end -->
