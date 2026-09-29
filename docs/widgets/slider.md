# Slider

<!-- generated:start -->

A draggable numeric control.

**Value:** A number.

## Properties

Common properties every widget has (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`) are documented once in [the message reference](../protocol/messages) — only `slider`-specific properties are listed below.

| Property  | Type                        | Required | Description                                                             |
| --------- | --------------------------- | -------- | ----------------------------------------------------------------------- |
| `confirm` | string                      | no       |                                                                         |
| `dis`     | boolean                     | no       |                                                                         |
| `max`     | number                      | **yes**  |                                                                         |
| `min`     | number                      | **yes**  |                                                                         |
| `step`    | number                      | no       | Default 1.                                                              |
| `val`     | number \| boolean \| string | no       | Optional initial/confirmed value; type depends on the control (§3.6.1). |
| `vert`    | boolean                     | no       |                                                                         |

## Example

```json
@{"t":"w","id":"pwm","k":"slider","min":0,"max":255,"val":0}
```

## Arduino library

`dash.slider(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

Controls aren't switchable between each other from the UI — their `id` is also their protocol identity (PRT-13), so changing kind would change what the device needs to recognize.

<!-- generated:end -->
