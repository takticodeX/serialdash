# Event log

<!-- generated:start -->

A scrolling log of device events.

**Value:** `e` events — does not use `ch`.

## Properties

Every widget also has a set of [common properties](../protocol/messages#common-widget-properties) (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`), documented once on the message reference page — only `log`-specific properties are listed below.

| Property                   | Type                                         | Required | Description                                                                                                 |
| -------------------------- | -------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| <a id="prop-lvl"></a>`lvl` | `"debug"` \| `"info"` \| `"warn"` \| `"err"` | no       | Minimum severity shown — events below this level are hidden from this widget.                               |
| <a id="prop-max"></a>`max` | integer                                      | no       | Max rows kept. Default 500.                                                                                 |
| <a id="prop-src"></a>`src` | string[]                                     | no       | Limits the log to events whose `src` matches one of these names. Shows events from every source if omitted. |

## Example

```json
@{"t":"w","id":"evt","k":"log","lvl":"warn","max":200}
```

## Arduino library

`dash.log(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

No other kind shares this one's value shape, so there's nothing to switch it to.

<!-- generated:end -->
