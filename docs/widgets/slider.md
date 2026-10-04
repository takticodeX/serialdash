# Slider

<!-- generated:start -->

A draggable numeric control.

**Value:** A number.

## Properties

Every widget also has a set of [common properties](../protocol/messages#common-widget-properties) (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`), documented once on the message reference page — only `slider`-specific properties are listed below.

| Property                           | Type                        | Required | Description                                                                                                                                                                                          |
| ---------------------------------- | --------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="prop-confirm"></a>`confirm` | string                      | no       | Confirmation prompt text. If set, the app asks the user to confirm with this message before sending the command.                                                                                     |
| <a id="prop-dis"></a>`dis`         | boolean                     | no       | Shows the control as disabled — the user can't interact with it until this is cleared.                                                                                                               |
| <a id="prop-max"></a>`max`         | number                      | **yes**  | Maximum value the slider can be dragged to.                                                                                                                                                          |
| <a id="prop-min"></a>`min`         | number                      | **yes**  | Minimum value the slider can be dragged to.                                                                                                                                                          |
| <a id="prop-step"></a>`step`       | number                      | no       | Increment the slider snaps to while dragging. Default 1.                                                                                                                                             |
| <a id="prop-val"></a>`val`         | number \| boolean \| string | no       | Initial/confirmed value, shown until the first `d` or control response arrives for this id. Type depends on the control: boolean for switch, number for slider/number, string for text/select/color. |
| <a id="prop-vert"></a>`vert`       | boolean                     | no       | Draws a vertical slider instead of horizontal.                                                                                                                                                       |

## Example

```json
@{"t":"w","id":"pwm","k":"slider","min":0,"max":255,"val":0}
```

## Arduino library

`dash.slider(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

Controls aren't switchable between each other from the UI — their `id` is also their protocol identity (it doubles as the channel id the device recognizes for this control), so changing kind would change what the device needs to match against.

<!-- generated:end -->
