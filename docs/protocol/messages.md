# Message reference

This page lists every message type in the protocol: what each one is for, every field it can carry, whether that field is required, and what it means. For the framing rules — the `@{...}` wrapper, line endings, escaping — see [overview](./overview.md).

Messages travel in both directions over the same connection. "Device → app" is what the device can send (sensor data, widget declarations, events); "App → device" is what the user's actions in the dashboard turn into (connecting, dragging a slider, clicking a button). A message's `t` field says which one it is.

<!-- generated:start -->

### Device → app

Every line the device sends is one of these, identified by its `t` field.

#### `hi` — Device presentation

Sent once by the device right after it starts (and again any time the app asks for one by sending its own `hi`). Identifies the device and its protocol version, and is normally followed immediately by the device's `w` widget declarations.

| Field   | Type    | Required | Description                                                                                                                                                          |
| ------- | ------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `v`     | integer | **yes**  | Protocol version the device speaks. The app uses this to know which message shapes to expect.                                                                        |
| `name`  | string  | **yes**  | Device name shown in the app's status bar and About panel.                                                                                                           |
| `fw`    | string  | no       | Firmware version string, shown alongside the device name. Entirely up to the sketch — not interpreted by the app.                                                    |
| `board` | string  | no       | Board name, e.g. "ESP32" or "Uno". Optional and purely informational.                                                                                                |
| `rx`    | integer | no       | Size, in bytes, of the device's incoming line buffer. Tells the app how long an app→device line is safe to send before the device would have to truncate or drop it. |

#### `u` — Partial update

Updates an existing widget's properties in place, without redeclaring it — only the given fields change, everything else about the widget stays as it was. `id` and `k` can't be changed this way; to change a widget's kind, remove it (`x`) and declare it again.

| Field | Type   | Required | Description                                                                                                                                                                |
| ----- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`  | string | **yes**  | Up to 16 characters, starting with a letter or underscore. Widget ids and channel ids are separate namespaces, so a widget and a channel are allowed to share the same id. |

#### `x` — Remove widget

Removes a widget from the dashboard, or every widget this device has declared if `id` is omitted.

| Field | Type   | Required | Description                                                                                                                                                                |
| ----- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`  | string | no       | Up to 16 characters, starting with a letter or underscore. Widget ids and channel ids are separate namespaces, so a widget and a channel are allowed to share the same id. |

#### `d` — Data

Carries one or more channels' current values. The most frequent message type on the wire — sent every time the device has new sensor/state data to report.

| Field | Type    | Required | Description                                                                                                                                                                                                                                                                    |
| ----- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `d`   | object  | **yes**  | Map of channel id to its new value. A channel doesn't need its own widget — an undeclared channel can still auto-create one, depending on the app's settings.                                                                                                                  |
| `ts`  | integer | no       | Device-side timestamp (typically `millis()`), in milliseconds. Lets the app align samples from a device that buffers or batches data instead of always using arrival time. Omit if the device has no clock worth reporting — the app then just timestamps the data on arrival. |

#### `e` — Event

A log event — shown in the app's console and in any `log` widgets. Used for status messages, warnings, and errors the device wants to surface, as distinct from regular channel data.

| Field | Type                                         | Required | Description                                                                                         |
| ----- | -------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `lvl` | `"debug"` \| `"info"` \| `"warn"` \| `"err"` | no       | Severity. Defaults to `info` if omitted.                                                            |
| `msg` | string                                       | **yes**  | The event text.                                                                                     |
| `src` | string                                       | no       | Optional origin label (e.g. a subsystem name), usable to filter a `log` widget to just this source. |

#### `ack` — Control acknowledgement

The device's response to an app→device `c` control command, matched back to it by `r`. Every `c` gets exactly one `ack` — the app's UI depends on it to know whether the command succeeded.

| Field | Type    | Required | Description                                                                                                                         |
| ----- | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `r`   | integer | **yes**  | Echoes the `r` of the `c` message this acknowledges.                                                                                |
| `ok`  | boolean | **yes**  | Whether the command was accepted. When `true`, the device is expected to also send a `d` with the control's actual resulting state. |
| `err` | string  | no       | Human-readable reason the command was rejected. Only meaningful when `ok` is `false`; shown to the user in the app.                 |

#### `pong` — Keep-alive reply

The device's response to an app→device `ping`, matched back to it by `r`. The app uses the round trip to show connection latency and to detect a device that's stopped responding.

| Field | Type    | Required | Description                                        |
| ----- | ------- | -------- | -------------------------------------------------- |
| `r`   | integer | **yes**  | Echoes the `r` of the `ping` message this answers. |

#### `w` — Widget declaration

Declares one widget on the dashboard. The exact set of allowed properties depends on `k`, the widget kind. See the widget catalog below for the full per-kind property list, and [common widget properties](#common-widget-properties) for the fields every kind shares.

### App → device

Every line the app sends is one of these.

#### `hi` — Handshake request

Asks the device to (re)identify itself and (re)declare its widgets — sent once when the app first connects, and again any time the user asks the app to rediscover the device.

| Field | Type | Required | Description                      |
| ----- | ---- | -------- | -------------------------------- |
| `v`   | `1`  | **yes**  | Protocol version the app speaks. |

#### `c` — Control command

Sends a command to one control (button, switch, slider, number, select, text, or color) — e.g. the user dragged a slider or clicked a button. The device answers with a matching `ack`.

| Field | Type                        | Required | Description                                                                                                                                                                |
| ----- | --------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `r`   | integer                     | **yes**  | Request id, chosen by the app. The device echoes it back in the `ack` so the app can match the response to this specific command.                                          |
| `id`  | string                      | **yes**  | Up to 16 characters, starting with a letter or underscore. Widget ids and channel ids are separate namespaces, so a widget and a channel are allowed to share the same id. |
| `v`   | number \| boolean \| string | **yes**  | The requested value. Its type depends on the target control: boolean for switch, number for slider/number, string for text/select/color.                                   |

#### `ping` — Keep-alive

A keep-alive the app sends periodically. The device answers with a matching `pong`, which the app uses to show connection latency and to detect a device that's stopped responding.

| Field | Type    | Required | Description                                                             |
| ----- | ------- | -------- | ----------------------------------------------------------------------- |
| `r`   | integer | **yes**  | Request id, chosen by the app. The device echoes it back in the `pong`. |

### Common widget properties

Every widget declared with `w` accepts these, regardless of kind (`t` and `k` aren't listed — `t` is always `"w"`, and `k` is the kind selector itself, covered in the widget catalog below).

| Field    | Type               | Required | Description                                                                                                                                                                                                   |
| -------- | ------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`     | string             | **yes**  | Up to 16 characters, starting with a letter or underscore. Widget ids and channel ids are separate namespaces, so a widget and a channel are allowed to share the same id.                                    |
| `title`  | string             | no       | Display title shown on the widget's card. Falls back to the widget's `id` if omitted.                                                                                                                         |
| `ch`     | string \| string[] | no       | Channels displayed by the widget (`ch`). A single id, or an array of ids for multi-channel widgets.                                                                                                           |
| `grp`    | string             | no       | Group name. Widgets sharing a `grp` are shown together under one dashboard tab; widgets with no `grp` land in the default tab.                                                                                |
| `ord`    | integer            | no       | Placement order within the widget's group — lower values are placed first. Widgets with no `ord` are placed after the ones that have one, in declaration order.                                               |
| `size`   | [integer, integer] | no       | Suggested size as `[width, height]` in dashboard grid cells (the grid is 12 columns wide). Only a starting point — the user can resize the widget afterward, and that override takes precedence from then on. |
| `unit`   | string             | no       | Unit suffix shown next to the value, e.g. `"C"` or `"rpm"`.                                                                                                                                                   |
| `dec`    | integer            | no       | Decimal places to display.                                                                                                                                                                                    |
| `labels` | string[]           | no       | Labels for each channel in `ch`, matched up positionally (first label for the first channel, and so on).                                                                                                      |
| `colors` | string[]           | no       | Colors for each channel in `ch`, matched up positionally, as #RRGGBB.                                                                                                                                         |
| `stale`  | number             | no       | Seconds of no new data before the widget dims and shows as stale. Default 5.                                                                                                                                  |

### Widget catalog

One schema per `k` in `/protocol/schema/widgets/`: `attitude`, `bar`, `button`, `color`, `compass`, `gauge`, `heat`, `hist`, `led`, `level`, `line`, `log`, `number`, `pie`, `polar`, `select`, `slider`, `switch`, `table`, `text`, `value`, `xy`.

<!-- generated:end -->
