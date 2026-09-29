# Event log

<!-- generated:start -->

A scrolling log of device events.

**Value:** `e` events — does not use `ch`.

## Properties

Common properties every widget has (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`) are documented once in [the message reference](../protocol/messages) — only `log`-specific properties are listed below.

| Property | Type                                         | Required | Description                 |
| -------- | -------------------------------------------- | -------- | --------------------------- |
| `lvl`    | `"debug"` \| `"info"` \| `"warn"` \| `"err"` | no       |                             |
| `max`    | integer                                      | no       | Max rows kept. Default 500. |
| `src`    | string[]                                     | no       |                             |

## Example

```json
@{"t":"w","id":"evt","k":"log","lvl":"warn","max":200}
```

## Arduino library

`dash.log(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

No other kind shares this one's value shape, so there's nothing to switch it to.

<!-- generated:end -->
