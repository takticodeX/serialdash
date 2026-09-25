# Message reference

This page lists every protocol v1 message type. The tables below are generated from the JSON Schema in `/protocol/schema` by `npm run gen` (DOC-02) — do not edit the block between the markers by hand; edit the schema and regenerate instead.

For the framing rules (`@{...}`, line endings, escaping) see [overview](./overview.md). For the full JSON Schema of each field see `/protocol/schema/device-to-app.schema.json`, `/protocol/schema/app-to-device.schema.json`, and `/protocol/schema/widgets/*.schema.json`.

<!-- generated:start -->

### Device → app

| `t`    | Fields (**bold** = required)                  |
| ------ | --------------------------------------------- |
| `hi`   | **v**, **name**, fw, board, rx                |
| `u`    | **id**                                        |
| `x`    | id                                            |
| `d`    | **d**, ts                                     |
| `e`    | lvl, **msg**, src                             |
| `ack`  | **r**, **ok**, err                            |
| `pong` | **r**                                         |
| `w`    | see widget catalog below — one schema per `k` |

### App → device

| `t`    | Fields (**bold** = required) |
| ------ | ---------------------------- |
| `hi`   | **v**                        |
| `c`    | **r**, **id**, **v**         |
| `ping` | **r**                        |

### Widget catalog

One schema per `k` in `/protocol/schema/widgets/`: `attitude`, `bar`, `button`, `color`, `compass`, `gauge`, `heat`, `hist`, `led`, `level`, `line`, `log`, `number`, `pie`, `polar`, `select`, `slider`, `switch`, `table`, `text`, `value`, `xy`.

<!-- generated:end -->
