# Bar chart

<!-- generated:start -->

One bar per channel, label, or array element.

**Value:** One number per channel, a label→number object, or a flat array of numbers.

## Properties

Every widget also has a set of [common properties](../protocol/messages#common-widget-properties) (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`), documented once on the message reference page — only `bar`-specific properties are listed below.

| Property                           | Type     | Required | Description                                                                                                                   |
| ---------------------------------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| <a id="prop-horiz"></a>`horiz`     | boolean  | no       | Draws horizontal bars instead of vertical ones.                                                                               |
| <a id="prop-max"></a>`max`         | number   | no       | Fixed value-axis maximum. Omit (along with `min`) to auto-scale to the data.                                                  |
| <a id="prop-min"></a>`min`         | number   | no       | Fixed value-axis minimum. Omit (along with `max`) to auto-scale to the data.                                                  |
| <a id="prop-xlabels"></a>`xlabels` | string[] | no       | Labels for each bar, used when the channel sends an array of numbers (one label per element) instead of a label→value object. |

## Example

```json
@{"t":"w","id":"spec","k":"bar","ch":"s","min":0,"max":100}
```

## Also the auto-discovery default

This is also the widget kind the app creates automatically for any channel with no `w` declaration at all, as soon as its value looks like an array of numbers of any other length — including one sent with nothing more than a plain `Serial.println`, no library and no protocol JSON required:

```cpp
Serial.println("spectrum:[10,45,23,67]");
```

See [dashboard → auto-discovery](../guide/dashboard#auto-discovery) for the full set of default widgets (with a screenshot for each), and [Arduino Plotter compatibility](../guide/plotter-compat) for the complete text format this line is written in.

## Arduino library

`dash.bar(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

No other kind shares this one's value shape, so there's nothing to switch it to.

<!-- generated:end -->
