# Heatmap

<!-- generated:start -->

A rows x cols color-mapped matrix.

**Value:** A flat array of `rows` × `cols` numbers, row-major.

## Properties

Every widget also has a set of [common properties](../protocol/messages#common-widget-properties) (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`), documented once on the message reference page — only `heat`-specific properties are listed below.

| Property                           | Type                                   | Required | Description                                                                                        |
| ---------------------------------- | -------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| <a id="prop-cols"></a>`cols`       | integer                                | **yes**  | Number of columns in the matrix.                                                                   |
| <a id="prop-interp"></a>`interp`   | boolean                                | no       | Smooths the color transition between adjacent cells instead of showing hard cell boundaries.       |
| <a id="prop-max"></a>`max`         | number                                 | no       | Value mapped to the end of the color palette. Omit (along with `min`) to auto-scale to the data.   |
| <a id="prop-min"></a>`min`         | number                                 | no       | Value mapped to the start of the color palette. Omit (along with `max`) to auto-scale to the data. |
| <a id="prop-palette"></a>`palette` | `"thermal"` \| `"viridis"` \| `"gray"` | no       | Named color gradient used to map values to colors.                                                 |
| <a id="prop-rows"></a>`rows`       | integer                                | **yes**  | Number of rows in the matrix.                                                                      |

## Example

```json
@{"t":"w","id":"grid","k":"heat","ch":"g","rows":4,"cols":4,"min":15,"max":35,"palette":"thermal"}
```

## Arduino library

`dash.heat(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

No other kind shares this one's value shape, so there's nothing to switch it to.

<!-- generated:end -->
