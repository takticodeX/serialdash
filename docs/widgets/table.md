# Table

<!-- generated:start -->

A key-value table, highlighting changed rows.

**Value:** A label→value object, or one value per channel (multi-`ch`).

## Properties

Every widget also has a set of [common properties](../protocol/messages#common-widget-properties) (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`), documented once on the message reference page — only `table`-specific properties are listed below.

| Property                     | Type     | Required | Description                                                                                             |
| ---------------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------- |
| <a id="prop-cols"></a>`cols` | string[] | no       | Column headers, used when the channel sends an array of values per row instead of a label→value object. |

## Example

```json
@{"t":"w","id":"status","k":"table","ch":"st"}
```

## Also the auto-discovery default

This is also the widget kind the app creates automatically for any channel with no `w` declaration at all, as soon as its value looks like a flat object of numbers/strings — including one sent with nothing more than a plain `Serial.println`, no library and no protocol JSON required:

```cpp
Serial.println("stats:{\"min\":18.2,\"max\":24.7}");
```

See [dashboard → auto-discovery](../guide/dashboard#auto-discovery) for the full set of default widgets (with a screenshot for each), and [Arduino Plotter compatibility](../guide/plotter-compat) for the complete text format this line is written in.

## Arduino library

`dash.table(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

No other kind shares this one's value shape, so there's nothing to switch it to.

<!-- generated:end -->
