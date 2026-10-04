# SerialDash

Turn any Arduino/ESP32 sketch into a live web dashboard over a single serial
line — no app-side code to write, no external dependencies, and it works on
any core exposing `Stream` (Uno, Mega, ESP32, ESP32-S3/C3, ESP8266, RP2040,
SAMD, ...).

Pair it with the [Serial Dash web app](https://takticodex.github.io/serialdash/)
(built on the Web Serial API, works offline as a PWA) to get line charts,
gauges, LEDs, sliders and more from plain, `Serial.print`-style calls — no
browser extension, no separate server.

> Full documentation, the protocol reference, and every widget's property
> table live at <https://takticodex.github.io/serialdash/docs/>.

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
sensors required — a simulated sine wave), `examples/03_WeatherStation` for
a fuller display-only dashboard, `examples/04_Controls` for the
bidirectional side below, or `examples/05_AllWidgets` for every widget kind
the app currently renders in one sketch (ESP32/ESP8266/RP2040/SAMD only —
too much flash for an Uno/Mega).

## Controls

```cpp
bool onFan(DashValue& v) {
  digitalWrite(PIN_FAN, v.toBool());
  return true;  // ack ok:true, then an echo `d` with the applied value
}

bool onPwm(DashValue& v) {
  int p = constrain(v.toInt(), 0, 200);  // limit accepted, echo what was really applied
  analogWrite(PIN_PWM, p);
  v.set(p);
  return true;
}

void onDeclare() {
  dash.toggle("fan", F("Fan"));
  dash.slider("pwm", F("Power")).range(0, 255);
}

void setup() {
  Serial.begin(115200);
  dash.begin(F("Demo"));
  dash.onControl("fan", onFan);
  dash.onControl("pwm", onPwm);
  dash.onDeclare(onDeclare);
}

void loop() {
  dash.loop();  // required — this is what reads and dispatches incoming commands
}
```

## Status

The full protocol is implemented: declaring widgets, sending data, and
receiving two-way commands back from the app — round-trip, rejection, and
`appConnected()` liveness detection all work end to end. Every widget kind
the app currently renders has a matching factory method here, controls
included.

## License

MIT — see [LICENSE](LICENSE).
