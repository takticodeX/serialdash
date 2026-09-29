# Button

<!-- generated:start -->

A push button that sends a command on click.

**Value:** Sends `true` (or `true`/`false` on press/release, with `hold`).

## Properties

Common properties every widget has (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`) are documented once in [the message reference](../protocol/messages) — only `button`-specific properties are listed below.

| Property  | Type                        | Required | Description                                                             |
| --------- | --------------------------- | -------- | ----------------------------------------------------------------------- |
| `color`   | string                      | no       | Color as #RRGGBB.                                                       |
| `confirm` | string                      | no       |                                                                         |
| `dis`     | boolean                     | no       |                                                                         |
| `hold`    | boolean                     | no       | Send true on press and false on release.                                |
| `label`   | string                      | no       |                                                                         |
| `val`     | number \| boolean \| string | no       | Optional initial/confirmed value; type depends on the control (§3.6.1). |

## Example

```json
@{"t":"w","id":"reboot","k":"button","confirm":"Are you sure?"}
```

## Arduino library

`dash.button(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

Controls aren't switchable between each other from the UI — their `id` is also their protocol identity (PRT-13), so changing kind would change what the device needs to recognize.

<!-- generated:end -->
