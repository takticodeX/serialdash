# Simulator

Click **"Try without hardware"** on the connect screen (or on the "browser not supported" page) to explore SerialDash with no board plugged in. A **Scenario** dropdown next to the button picks which of the 5 scenarios below it runs — it defaults to "All widgets."

The simulator is a virtual device speaking protocol v1 exactly like a real one — it goes through the same handshake, widget declarations, and data flow as a real connection, so anything you see with it behaves the same way it would with real hardware.

## All widgets

Declares every implemented widget kind and feeds each one from its own demo data generator — display widgets included, plus all 7 control widgets, which actually respond to what you do with them: a switch toggles for real, a slider clamps anything past its declared range and echoes what was really applied (SPEC.md §3.6 rule 4), and the button is rejected whenever the switch is on (mirroring the library's own `onControl` reject example, §6.5). It's driven by the same descriptor every widget ships with (SPEC.md §4, DOC-01), so it stays in sync automatically as new widgets are added. This is also what the app's own e2e suite connects to by default.

## Weather station

Just the P0 display widgets — line chart, value, gauge, indicator, event log — with the same demo data "All widgets" uses for them, minus everything else. A quieter dashboard for a first look, or for screenshots that don't need every widget kind crowded in.

## Motor control

Just the 3 P0 controls — button, switch, slider — the same ones and the same reject/clamp behavior as "All widgets," isolated so the bidirectional flow is the only thing on screen.

## Protocol errors

Mostly ordinary weather-station-shaped data, with roughly one line in three replaced by something deliberately broken instead: invalid JSON, valid JSON missing a required field, an invalid widget id, or plain garbled text. Use this to see how the console and the status bar's protocol-error counter behave when a device (or a flaky connection) sends something the parser can't accept — SerialDash keeps going rather than getting stuck on a bad line (PRT-04).

## Stress test

No widgets are declared at all — a small pool of channels gets flooded with data at roughly 1000 lines/s, and whatever ends up on screen comes entirely from auto-discovery reacting to that throughput. Useful as a manual sanity check of how the UI holds up under a fast stream; it isn't hooked up to an automated pass/fail check.

## Disconnecting

The simulator disconnects like any other session — the dashboard stays visible afterward (SPEC.md §3.5 rule 6), and you can reconnect to it again from "change device."
