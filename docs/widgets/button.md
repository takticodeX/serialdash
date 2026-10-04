# Button

<!-- generated:start -->

A push button that sends a command on click.

**Value:** Sends `true` (or `true`/`false` on press/release, with `hold`).

## Properties

Every widget also has a set of [common properties](../protocol/messages#common-widget-properties) (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`), documented once on the message reference page — only `button`-specific properties are listed below.

| Property                           | Type                        | Required | Description                                                                                                                                                                                          |
| ---------------------------------- | --------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="prop-color"></a>`color`     | string                      | no       | Button background color (#RRGGBB).                                                                                                                                                                   |
| <a id="prop-confirm"></a>`confirm` | string                      | no       | Confirmation prompt text. If set, the app asks the user to confirm with this message before sending the command.                                                                                     |
| <a id="prop-dis"></a>`dis`         | boolean                     | no       | Shows the control as disabled — the user can't interact with it until this is cleared.                                                                                                               |
| <a id="prop-hold"></a>`hold`       | boolean                     | no       | Send true on press and false on release.                                                                                                                                                             |
| <a id="prop-label"></a>`label`     | string                      | no       | Button text. Falls back to the widget's title, or its id, if omitted.                                                                                                                                |
| <a id="prop-val"></a>`val`         | number \| boolean \| string | no       | Initial/confirmed value, shown until the first `d` or control response arrives for this id. Type depends on the control: boolean for switch, number for slider/number, string for text/select/color. |

## Example

```json
@{"t":"w","id":"reboot","k":"button","confirm":"Are you sure?"}
```

## Arduino library

`dash.button(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

Controls aren't switchable between each other from the UI — their `id` is also their protocol identity (it doubles as the channel id the device recognizes for this control), so changing kind would change what the device needs to match against.

<!-- generated:end -->
