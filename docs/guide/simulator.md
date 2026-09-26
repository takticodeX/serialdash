# Simulator

Click **"Try without hardware"** on the connect screen (or on the "browser not supported" page) to explore SerialDash with no board plugged in.

The simulator is a virtual device speaking protocol v1 exactly like a real one — it goes through the same handshake, widget declarations, and data flow as a real connection, so anything you see with it behaves the same way it would with real hardware.

## The "All widgets" scenario

The one scenario available today declares every implemented widget kind — the P0 set: [line chart](../widgets/line), [value](../widgets/value), [gauge](../widgets/gauge), [indicator](../widgets/led), [event log](../widgets/log), and — since M4 — the three control widgets, button, switch, and slider. Display widgets are each fed by their own demo data generator; controls actually respond to what you do with them: the switch toggles for real, the slider clamps anything past 200 and echoes what was really applied (SPEC.md §3.6 rule 4), and the button is rejected whenever the switch is on (mirroring the library's own `onControl` reject example, §6.5). It's driven by the same descriptor every widget ships with (SPEC.md §4, DOC-01), so it stays in sync automatically as new widgets are added.

::: info Scope note
Dedicated named scenarios ("Weather station" as its own picker entry, "Stress test", "Protocol errors") are listed in SPEC.md §5.7 (APP-SIM-02) but not built yet — the reject/clamp behavior described above already covers what "Motor control" was meant to demonstrate, just as part of "All widgets" rather than a separate scenario. The simulator is also what M2's and M4's acceptance criteria check against directly, including the e2e suite (`app/e2e/controls.spec.ts`).
:::

## Disconnecting

The simulator disconnects like any other session — the dashboard stays visible afterward (SPEC.md §3.5 rule 6), and you can reconnect to it again from "change device."
