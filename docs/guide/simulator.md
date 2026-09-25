# Simulator

Click **"Try without hardware"** on the connect screen (or on the "browser not supported" page) to explore SerialDash with no board plugged in.

The simulator is a virtual device speaking protocol v1 exactly like a real one — it goes through the same handshake, widget declarations, and data flow as a real connection, so anything you see with it behaves the same way it would with real hardware.

## The "All widgets" scenario

The one scenario available today declares every implemented widget kind — currently the P0 set: [line chart](../widgets/line), [value](../widgets/value), [gauge](../widgets/gauge), [indicator](../widgets/led), and [event log](../widgets/log) — each fed by that widget's own demo data generator, plus an occasional log event. It's driven by the same descriptor every widget ships with (SPEC.md §4, DOC-01), so it stays in sync automatically as new widgets are added.

::: info Scope note
More scenarios ("Weather station", "Motor control" with rejected commands, "Stress test", "Protocol errors") are listed in SPEC.md §5.7 (APP-SIM-02) but not built yet — some need bidirectional controls (M4) or aren't required until later. The simulator is also what M2's own acceptance criterion checks: the "All widgets (P0)" scenario renders correctly.
:::

## Disconnecting

The simulator disconnects like any other session — the dashboard stays visible afterward (SPEC.md §3.5 rule 6), and you can reconnect to it again from "change device."
