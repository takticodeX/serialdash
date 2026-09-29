# Bar chart

<!-- generated:start -->

One bar per channel, label, or array element.

**Value:** One number per channel, a label→number object, or a flat array of numbers.

## Properties

Common properties every widget has (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`) are documented once in [the message reference](../protocol/messages) — only `bar`-specific properties are listed below.

| Property  | Type     | Required | Description |
| --------- | -------- | -------- | ----------- |
| `horiz`   | boolean  | no       |             |
| `max`     | number   | no       |             |
| `min`     | number   | no       |             |
| `xlabels` | string[] | no       |             |

## Example

```json
@{"t":"w","id":"spec","k":"bar","ch":"s","min":0,"max":100}
```

## Arduino library

`dash.bar(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

No other kind shares this one's value shape, so there's nothing to switch it to.

<!-- generated:end -->
