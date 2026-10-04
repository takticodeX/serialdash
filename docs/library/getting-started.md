# Getting started

This walks through the library's core concepts. If you just want a sketch running, see [Quick start](../guide/quick-start) instead — come back here once it's working and you want to understand what it did.

## The four calls every sketch makes

```cpp
#include <SerialDash.h>

SerialDash dash(Serial);  // works on any Stream: Serial1, SoftwareSerial, BluetoothSerial, ...

void onDeclare() {
  dash.line("temp", F("Temperature")).ch("t").unit(F("C"));
}

void setup() {
  Serial.begin(115200);
  dash.begin(F("My Device"), F("1.0.0"));  // name shown in the app, your own version string
  dash.onDeclare(onDeclare);                // called on every handshake — see below
}

void loop() {
  dash.loop();                    // required: reads and dispatches incoming hi/ping/c
  dash.send("t", 23.4);
  delay(200);
}
```

- **`dash.begin(name, version)`** — once, in `setup()`. Nothing is sent yet; it just records what to answer the app's handshake with.
- **`dash.onDeclare(callback)`** — registers a function to be called **every time the app (re)connects**, not just once. This matters: the app builds its dashboard entirely from whatever your `onDeclare` sends — the device is the only source of truth for what widgets exist — so a fresh connection has to see the same declarations again. Put every `dash.line(...)`/`dash.button(...)`/etc. call in here, not in `setup()`.
- **`dash.loop()`** — call this on every pass through `loop()`, unconditionally. It's what reads incoming bytes and answers `hi`/`ping`, and dispatches `c` (control) messages to your `onControl` callbacks. Skipping it (or calling it rarely, behind a slow `delay()`) is why a device stops responding to pings or controls.
- **`dash.send(channel, value)`** (or the `dash.data()...` builder for several channels in one message) — sends the actual data a declared widget displays.

## Declaring a widget

Every widget kind has a matching factory method — `dash.line(...)`, `dash.gauge(...)`, `dash.button(...)`, and so on — each returning a chainable builder for that kind's properties:

```cpp
dash.gauge("hum", F("Humidity"))
    .ch("h")
    .range(0, 100)
    .zone(0, 30, "#e67e22")
    .zone(30, 70, "#2ecc71")
    .zone(70, 100, "#3498db");
```

See the [widget catalog](../widgets/) for every kind's properties, or the [API reference](./api) for the full chainable method list.

## Controls (two-way)

A control (button, switch, slider, number, select, text, color) is declared the same way, but also needs a handler:

```cpp
bool onFan(DashValue& v) {
  bool on = v.toBool();
  digitalWrite(PIN_FAN, on);
  return true;  // ack ok:true — the library echoes the confirmed state back automatically
}

void onDeclare() {
  dash.toggle("fan", F("Fan")).value(false);
}

void setup() {
  // ...
  dash.onControl("fan", onFan);
}
```

`DashValue` gives you tolerant conversions (`toBool()`, `toInt()`, `toFloat()`, `toString()`) regardless of what type the app actually sent. Call `v.set(x)` inside the handler to echo back something other than what was requested (e.g. a clamped value), or `return v.reject(F("reason"))` to refuse the command — see [Controls](../protocol/controls) for the full state machine this drives on the app side.

## Where to go next

- [Widget catalog](../widgets/) — every widget kind, its properties, and its Arduino example.
- [API reference](./api) — the complete method list.
- [Compile-time options](./options) — buffer sizes, thread safety, and other macros.
- `lib/SerialDash/examples/` — runnable sketches, from "hello world" to every widget kind at once.
