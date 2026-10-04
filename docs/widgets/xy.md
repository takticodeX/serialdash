# XY plot

<!-- generated:start -->

A scatter or line plot of [x, y] pairs.

**Value:** An `[x, y]` pair.

## Properties

Every widget also has a set of [common properties](../protocol/messages#common-widget-properties) (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`), documented once on the message reference page — only `xy`-specific properties are listed below.

| Property                         | Type                    | Required | Description                                                                   |
| -------------------------------- | ----------------------- | -------- | ----------------------------------------------------------------------------- |
| <a id="prop-mode"></a>`mode`     | `"points"` \| `"lines"` | no       | `points` plots each sample as a dot; `lines` connects them. Default `points`. |
| <a id="prop-trail"></a>`trail`   | integer                 | no       | Number of most recent points kept on screen. Default 500.                     |
| <a id="prop-xlabel"></a>`xlabel` | string                  | no       | Label shown below the X axis.                                                 |
| <a id="prop-xmax"></a>`xmax`     | number                  | no       | Fixed X-axis maximum. Omit (along with `xmin`) to auto-scale to the data.     |
| <a id="prop-xmin"></a>`xmin`     | number                  | no       | Fixed X-axis minimum. Omit (along with `xmax`) to auto-scale to the data.     |
| <a id="prop-ylabel"></a>`ylabel` | string                  | no       | Label shown beside the Y axis.                                                |
| <a id="prop-ymax"></a>`ymax`     | number                  | no       | Fixed Y-axis maximum. Omit (along with `ymin`) to auto-scale to the data.     |
| <a id="prop-ymin"></a>`ymin`     | number                  | no       | Fixed Y-axis minimum. Omit (along with `ymax`) to auto-scale to the data.     |

## Example

```json
@{"t":"w","id":"pos","k":"xy","ch":"p","xmin":-1.2,"xmax":1.2,"ymin":-1.2,"ymax":1.2,"mode":"lines"}
```

## Also the auto-discovery default

This is also the widget kind the app creates automatically for any channel with no `w` declaration at all, as soon as its value looks like an array of exactly 2 numbers — including one sent with nothing more than a plain `Serial.println`, no library and no protocol JSON required:

```cpp
Serial.println("pos:[3.0,4.0]");
```

See [dashboard → auto-discovery](../guide/dashboard#auto-discovery) for the full set of default widgets (with a screenshot for each), and [Arduino Plotter compatibility](../guide/plotter-compat) for the complete text format this line is written in.

## Arduino library

`dash.xy(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

No other kind shares this one's value shape, so there's nothing to switch it to.

<!-- generated:end -->
