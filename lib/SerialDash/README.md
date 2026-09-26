# SerialDash

Turn any Arduino/ESP32 sketch into a live web dashboard over a single serial
line — no app-side code to write, no external dependencies, and it works on
any core exposing `Stream` (Uno, Mega, ESP32, ESP32-S3/C3, ESP8266, RP2040,
SAMD, ...).

Pair it with the [SerialDash web app](https://serialdash.github.io/) (built
on the Web Serial API, works offline as a PWA) to get line charts, gauges,
LEDs, sliders and more from plain, `Serial.print`-style calls — no browser
extension, no separate server.

> Full documentation, the protocol reference, and every widget's property
> table live at <https://serialdash.github.io/>.

## Installing

- **Arduino Library Manager**: Sketch → Include Library → Manage Libraries…,
  search "SerialDash", Install.
- **PlatformIO**: add `serialdash/SerialDash` to your `lib_deps`.
- **Manual**: download this repository's `lib/SerialDash` folder as a zip and
  use Sketch → Include Library → Add .ZIP Library…

## A complete example

```cpp
#include <SerialDash.h>

SerialDash dash(Serial);

void onDeclare() {
  dash.line("t", F("Temperature")).ch("t1").unit(F("C")).range(-10, 45);
  dash.gauge("h", F("Humidity")).ch("h1").range(0, 100);
}

void setup() {
  Serial.begin(115200);
  dash.begin(F("Weather"));
  dash.onDeclare(onDeclare);
}

void loop() {
  dash.loop();
  dash.send("t1", readTemperature());
  dash.send("h1", readHumidity());
  delay(200);
}
```

Load `examples/02_FirstChart` for the simplest possible starting point (no
sensors required — a simulated sine wave), or `examples/03_WeatherStation`
for a fuller dashboard.

## Status

This is the transmit-only slice of the library (SPEC.md's M3): declaring
widgets and sending data works end to end. Reading commands back from the
app (`onControl`, `appConnected()` actually reporting connection state) lands
in M4 — see the [SPEC](https://github.com/serialdash/serialdash) for the full
milestone plan.

## License

MIT — see [LICENSE](LICENSE).
