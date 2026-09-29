# Quick start

Five minutes, no existing sketch required.

## 1. Install the library

See [Install](../library/install) — the short version is: download this repo and drop `lib/SerialDash` into your Arduino `libraries/` folder, or add it to `platformio.ini`.

## 2. Flash the example

Open **File → Examples → SerialDash → 02_FirstChart** in the Arduino IDE (or `lib/SerialDash/examples/02_FirstChart` in PlatformIO), select your board and port, and upload. No wiring needed — it sends a simulated sine wave.

```cpp
#include <SerialDash.h>

SerialDash dash(Serial);

void onDeclare() {
  dash.line("sine", F("Sine wave")).ch("v").unit(F("V")).range(-1.2, 1.2).window(20);
}

void setup() {
  Serial.begin(115200);
  dash.begin(F("FirstChart"), F("1.0.0"));
  dash.onDeclare(onDeclare);
}

void loop() {
  dash.loop();
  dash.send("v", sin(millis() / 1000.0), 3);
  delay(50);
}
```

## 3. Open SerialDash and connect

Open the app in a Chromium-based browser (Chrome, Edge, Opera, or Brave — see [Connecting](./connecting) for why it has to be one of those). Click **Connect**, pick your board's port from the browser's picker, and click **Connect** again in the dialog.

## 4. See your chart

Once connected you land on the dashboard, and a single line chart titled "Sine wave" should be scrolling across the screen. If nothing shows up, check the console panel below the dashboard for what the board is actually sending — see [Troubleshooting](../troubleshooting) if it's not what you expect.

## No board handy?

Click **"Try without hardware"** on the connect screen instead — the built-in simulator speaks the exact same protocol a real board would, so everything else in this guide (and the rest of the docs) still applies. See [Simulator](./simulator) for the other scenarios it offers.

## Already have a sketch that isn't using the library?

If it just does plain `Serial.println("label:value")` or `Serial.println("value,value")` calls, SerialDash recognizes that shape as data automatically — see [Arduino Plotter compatibility](./plotter-compat). No library, no re-flashing.

## Next steps

- [Dashboard](./dashboard) — rearranging widgets, overrides, profiles.
- [Controls](./controls) — sending commands back to the device.
- [Widget catalog](../widgets/) — every widget kind and what it needs from the device.
