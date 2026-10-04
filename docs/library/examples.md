# Examples

Every example lives under `lib/SerialDash/examples/` and shows up in the Arduino IDE under **File → Examples → SerialDash**. Each has a header comment with its purpose, hardware needs (most need none), and what to expect in the dashboard — this page is just an index.

| Example                                    | What it shows                                                                                                                     | Hardware needed                                         |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [`01_TextOnly`](#_01-textonly)             | The console works with an ordinary sketch that doesn't use the library at all.                                                    | None                                                    |
| [`02_FirstChart`](#_02-firstchart)         | The smallest possible sketch: one line chart fed by `sin()`. Start here.                                                          | None                                                    |
| [`03_WeatherStation`](#_03-weatherstation) | A full dashboard — line, gauge, value, indicator, events — with simulated sensor values.                                          | None                                                    |
| [`04_Controls`](#_04-controls)             | Bidirectional controls: a switch wired to the board's real LED, a slider that clamps and echoes, a button that can be rejected.   | None (uses the built-in LED)                            |
| [`05_AllWidgets`](#_05-allwidgets)         | Every widget kind the app currently renders, including real handlers for all 7 controls.                                          | None — **non-AVR only**, too much flash for an Uno/Mega |
| [`07_TextCommands`](#_07-textcommands)     | Plain text output/input and SerialDash protocol lines coexisting on the same `Stream`, for sketches with their own text commands. | None                                                    |

`06_ESP32_Tasks` (two FreeRTOS tasks sending data in parallel, ESP32-only) and `08_ThermalCamera` (an 8×8 heatmap from a real AMG8833 sensor) are planned but not written yet.

## 01_TextOnly

Any line that doesn't start with `@{` is shown as plain text, exactly like the Arduino IDE's Serial Monitor — this is the sketch to load first, before installing anything new, just to confirm SerialDash replaces your existing workflow without changing it. No dashboard widgets appear; watch "tick N" print once a second in the console.

## 02_FirstChart

The "hello world" of SerialDash. One `dash.line(...)` declaration and one `dash.send(...)` call per loop, feeding a sine wave into a single chart. This is also the sketch the CI size report compiles for an Uno (with and without the library) to measure flash/RAM overhead.

## 03_WeatherStation

The core display widgets at once, all simulated (`sin()`/`millis()`, no sensors needed): a two-channel temperature line chart, a humidity gauge with colored zones, a pressure value card, a pump status indicator, and a periodic warning event.

## 04_Controls

The bidirectional half: a switch that lights/dims the board's actual built-in LED, a slider that clamps whatever you drag it to and echoes back what was really applied, and a button that demonstrates rejection — pressing it while the switch is on gets refused with a reason, mirroring the protocol's own worked example for `onControl`.

## 05_AllWidgets

Declares and drives all 18 widget kinds — every display widget plus real `onControl` handlers for all 7 controls (not just declarations), so you can exercise the full catalog against real firmware instead of only the browser simulator. Needs more flash than an AVR board provides; pick an ESP32/ESP8266/RP2040/SAMD board.

## 07_TextCommands

Shows a dashboard LED widget toggling from real commands, while a plain `"status: ok"` line keeps printing to the console once a second exactly as if SerialDash weren't there — and typing `on`/`off` into the console's send field talks to the sketch's own text-command handler, not the protocol. Useful if a sketch already has text commands you don't want to give up when adding a dashboard.
