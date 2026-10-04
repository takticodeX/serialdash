# Select

<!-- generated:start -->

A dropdown choice control.

**Value:** A string, matching one of `opts`.

## Properties

Every widget also has a set of [common properties](../protocol/messages#common-widget-properties) (`id`, `title`, `ch`, `grp`, `ord`, `size`, `unit`, `dec`, `labels`, `colors`, `stale`), documented once on the message reference page — only `select`-specific properties are listed below.

| Property                           | Type                         | Required | Description                                                                                                                                                                                          |
| ---------------------------------- | ---------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="prop-confirm"></a>`confirm` | string                       | no       | Confirmation prompt text. If set, the app asks the user to confirm with this message before sending the command.                                                                                     |
| <a id="prop-dis"></a>`dis`         | boolean                      | no       | Shows the control as disabled — the user can't interact with it until this is cleared.                                                                                                               |
| <a id="prop-opts"></a>`opts`       | string \| [string, string][] | no       | The list of choices. Each entry is either a bare string (used as both the value sent on the wire and the displayed label) or a `[value, label]` pair for a label that differs from the value.        |
| <a id="prop-val"></a>`val`         | number \| boolean \| string  | no       | Initial/confirmed value, shown until the first `d` or control response arrives for this id. Type depends on the control: boolean for switch, number for slider/number, string for text/select/color. |

## Example

```json
@{"t":"w","id":"mode","k":"select","opts":["auto","manual"],"val":"auto"}
```

## Arduino library

`dash.select(id, title)` — see the [library reference](../library/api) for the full chainable property list, and `lib/SerialDash/examples/` for a runnable sketch using it.

## Compatible templates for switching type

Controls aren't switchable between each other from the UI — their `id` is also their protocol identity (it doubles as the channel id the device recognizes for this control), so changing kind would change what the device needs to match against.

<!-- generated:end -->
