# Level bar

<!-- generated:start -->

A horizontal or vertical fill/progress bar.

**Value:** A number.

## Properties

Every widget also has a set of [common properties](../protocol/messages#common-widget-properties) (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`), documented once on the message reference page — only `level`-specific properties are listed below.

| Property                       | Type                       | Required | Description                                                  |
| ------------------------------ | -------------------------- | -------- | ------------------------------------------------------------ |
| <a id="prop-max"></a>`max`     | number                     | no       | Value that maps to a completely full bar.                    |
| <a id="prop-min"></a>`min`     | number                     | no       | Value that maps to an empty bar.                             |
| <a id="prop-vert"></a>`vert`   | boolean                    | no       | Draws a vertical bar instead of horizontal.                  |
| <a id="prop-zones"></a>`zones` | [number, number, string][] | no       | Color bands drawn behind the fill, each `[from, to, color]`. |

## Example

```json
@{"t":"w","id":"tank","k":"level","ch":"lvl","min":0,"max":100,"unit":"%","zones":[[0,20,"#e74c3c"],[20,100,"#2ecc71"]]}
```

## Arduino library

`dash.level(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

From the widget's settings panel, this widget can be switched to: `line`, `value`, `gauge` — same value shape, no firmware change needed.

<!-- generated:end -->
