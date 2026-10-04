# Pie chart

<!-- generated:start -->

A pie or donut chart of labeled values.

**Value:** A label→number object.

## Properties

Every widget also has a set of [common properties](../protocol/messages#common-widget-properties) (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`), documented once on the message reference page — only `pie`-specific properties are listed below.

| Property                       | Type    | Required | Description                                                        |
| ------------------------------ | ------- | -------- | ------------------------------------------------------------------ |
| <a id="prop-donut"></a>`donut` | boolean | no       | Draws the chart as a donut (hollow center) instead of a solid pie. |
| <a id="prop-pct"></a>`pct`     | boolean | no       | Shows each slice's percentage of the total alongside its label.    |

## Example

```json
@{"t":"w","id":"pwr","k":"pie","ch":"p","donut":true}
```

## Arduino library

`dash.pie(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

No other kind shares this one's value shape, so there's nothing to switch it to.

<!-- generated:end -->
