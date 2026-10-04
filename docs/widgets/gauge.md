# Gauge

<!-- generated:start -->

A needle gauge with configurable color zones.

**Value:** A number.

## Properties

Every widget also has a set of [common properties](../protocol/messages#common-widget-properties) (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`), documented once on the message reference page — only `gauge`-specific properties are listed below.

| Property                       | Type                       | Required | Description                                                    |
| ------------------------------ | -------------------------- | -------- | -------------------------------------------------------------- |
| <a id="prop-max"></a>`max`     | number                     | **yes**  | Value at the end of the needle's sweep.                        |
| <a id="prop-min"></a>`min`     | number                     | **yes**  | Value at the start of the needle's sweep.                      |
| <a id="prop-zones"></a>`zones` | [number, number, string][] | no       | Color bands drawn behind the needle, each `[from, to, color]`. |

## Example

```json
@{"t":"w","id":"g1","k":"gauge","ch":"h","min":0,"max":100,"zones":[[0,30,"#e67e22"],[30,70,"#2ecc71"],[70,100,"#3498db"]]}
```

## Arduino library

`dash.gauge(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

From the widget's settings panel, this widget can be switched to: `line`, `value`, `level` — same value shape, no firmware change needed.

<!-- generated:end -->
