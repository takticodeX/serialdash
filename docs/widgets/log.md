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

<!-- generated:end -->

## Arduino library example

Arrives with the library (M3) — the builder method for `k: "log"`, and a runnable example sketch.

## Compatible templates for switching type

Arrives with dashboard overrides (M5, APP-DSH-05).
