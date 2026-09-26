#pragma once

#include <Arduino.h>

// ---- Compile-time options (SPEC.md §6.2) ----
// Definable before this #include, or as a build flag.

#ifndef SERIALDASH_RX_BUFFER
#ifdef __AVR__
#define SERIALDASH_RX_BUFFER 64
#else
#define SERIALDASH_RX_BUFFER 256
#endif
#endif

#ifndef SERIALDASH_MAX_CONTROLS
#ifdef __AVR__
#define SERIALDASH_MAX_CONTROLS 6
#else
#define SERIALDASH_MAX_CONTROLS 32
#endif
#endif

#ifndef SERIALDASH_MAX_CHANNELS_ARG
#define SERIALDASH_MAX_CHANNELS_ARG 8
#endif

#ifndef SERIALDASH_THREAD_SAFE
#ifdef ARDUINO_ARCH_ESP32
#define SERIALDASH_THREAD_SAFE 1
#else
#define SERIALDASH_THREAD_SAFE 0
#endif
#endif

#ifndef SERIALDASH_FLOAT_DECIMALS
#define SERIALDASH_FLOAT_DECIMALS 3
#endif

#include "internal/DataBuilder.h"
#include "internal/JsonWriter.h"
#include "internal/WidgetBuilder.h"

#if SERIALDASH_THREAD_SAFE && defined(ARDUINO_ARCH_ESP32)
#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>
#endif

/// Declares the id-only and id+title overloads of one widget-kind factory
/// method (LIB-TX-01 requires "a method per type in §4"). A macro instead of
/// hand-writing ~40 near-identical two-line methods (one pair per kind in
/// SPEC.md §4.1/§4.3) — every one of them just forwards to `widget()` with a
/// fixed `k`, so the only thing that actually varies is the method name and
/// the kind string, which is exactly what `SERIALDASH_WIDGET_FACTORY`'s two
/// arguments capture.
#define SERIALDASH_WIDGET_FACTORY(methodName, kindLiteral)     \
  template <typename TId>                                      \
  serialdash::WidgetBuilder methodName(TId id) {               \
    return widget(id, F(kindLiteral));                         \
  }                                                            \
  template <typename TId, typename TTitle>                     \
  serialdash::WidgetBuilder methodName(TId id, TTitle title) { \
    serialdash::WidgetBuilder b = widget(id, F(kindLiteral));  \
    b.title(title);                                            \
    return b;                                                  \
  }

/**
 * Entry point of the SerialDash library (SPEC.md §6). One instance wraps any
 * Arduino `Stream` — `Serial`, `Serial1`, `SoftwareSerial`, native USB CDC,
 * `BluetoothSerial` on ESP32 — and speaks SerialDash protocol v1 over it, so
 * the same sketch code works unchanged regardless of which physical link
 * carries it (LIB-GEN-04).
 *
 * Example:
 * @code
 * SerialDash dash(Serial);
 *
 * void onDeclare() {
 *   dash.line("t", F("Temperature")).ch("t1").unit(F("C")).range(-10, 45);
 * }
 *
 * void setup() {
 *   Serial.begin(115200);
 *   dash.begin(F("Demo"));
 *   dash.onDeclare(onDeclare);
 * }
 *
 * void loop() {
 *   dash.loop();
 *   dash.send("t1", 22.5);
 * }
 * @endcode
 */
class SerialDash {
 public:
  /// Wraps `stream`. Does not take ownership and does not call
  /// `stream.begin()` — the sketch initializes its Stream as usual, before
  /// or after constructing this object.
  explicit SerialDash(Stream& stream) : _stream(stream) {}

  // ---- Lifecycle (§6.4) ----

  /// Sends `hi` (device presentation, §3.3) identifying the device to the
  /// app, then invokes the `onDeclare` callback (if already registered via
  /// `onDeclare()`) so the sketch can (re)declare its widgets — matching
  /// PRT-20's "device sends `hi` at startup, followed by all `w`
  /// declarations". `name` is required (max 32 chars); `fw` is an optional
  /// firmware version string (max 16 chars).
  template <typename TName>
  void begin(TName name, const char* fw = nullptr) {
    beginImpl(name, fw);
  }
  template <typename TName>
  void begin(TName name, const __FlashStringHelper* fw) {
    beginImpl(name, fw);
  }

  /// Must be called on every pass of the sketch's `loop()`. As of M3
  /// (SPEC.md §11, transmission-only milestone) this is a deliberate no-op:
  /// reading and dispatching incoming bytes — the app's `hi`
  /// request/`ping`/`c` (§6.3, LIB-RX-01..07) — lands in M4. It is still a
  /// real call site today so sketches that call it now keep compiling
  /// unchanged once M4 fills it in.
  void loop() {}

  /// Registers the callback that declares widgets and invokes it
  /// immediately. There is no handshake to wait for yet in M3: the full
  /// PRT-20 behavior ("device replies to every `hi` from the app") needs
  /// the receive side that lands in M4, so today a sketch declares once,
  /// right after `begin()` sends the initial `hi`.
  void onDeclare(void (*cb)()) {
    _onDeclare = cb;
    if (_onDeclare != nullptr) _onDeclare();
  }

  /// Whether the app is known to be listening (SPEC.md §3.5 rule 5: `hi`
  /// received, plus a `ping` within the last 5s). Always `false` in M3 — a
  /// truthful answer needs the receive-side handshake/ping tracking that
  /// lands in M4 together with the rest of §6.3/§6.5. The signature exists
  /// now because it is normative in §6.4 and sketches are expected to call
  /// it (e.g. to skip sending data when nobody is listening); it simply
  /// always says "no" until M4.
  bool appConnected() const { return false; }

  // ---- Widget declarations (LIB-TX-01) ----

  /// Generic factory for widget kinds without a dedicated named method yet
  /// (e.g. future kinds beyond SPEC.md §4). Every named factory below
  /// (`line()`, `gauge()`, ...) is defined purely in terms of this one.
  template <typename TId, typename TKind>
  serialdash::WidgetBuilder widget(TId id, TKind kind) {
    return serialdash::WidgetBuilder(_stream, id, kind);
  }

  // Display widgets (§4.1).
  SERIALDASH_WIDGET_FACTORY(line, "line")
  SERIALDASH_WIDGET_FACTORY(value, "value")
  SERIALDASH_WIDGET_FACTORY(gauge, "gauge")
  SERIALDASH_WIDGET_FACTORY(led, "led")
  SERIALDASH_WIDGET_FACTORY(log, "log")
  SERIALDASH_WIDGET_FACTORY(xy, "xy")
  SERIALDASH_WIDGET_FACTORY(bar, "bar")
  SERIALDASH_WIDGET_FACTORY(pie, "pie")
  SERIALDASH_WIDGET_FACTORY(level, "level")
  SERIALDASH_WIDGET_FACTORY(table, "table")
  SERIALDASH_WIDGET_FACTORY(heat, "heat")
  SERIALDASH_WIDGET_FACTORY(hist, "hist")
  SERIALDASH_WIDGET_FACTORY(polar, "polar")
  SERIALDASH_WIDGET_FACTORY(compass, "compass")
  SERIALDASH_WIDGET_FACTORY(attitude, "attitude")

  // Controls (§4.3). `toggle()` maps to `k:"switch"` since `switch` is a
  // reserved C++ keyword (LIB-TX-01).
  SERIALDASH_WIDGET_FACTORY(button, "button")
  SERIALDASH_WIDGET_FACTORY(toggle, "switch")
  SERIALDASH_WIDGET_FACTORY(slider, "slider")
  SERIALDASH_WIDGET_FACTORY(number, "number")
  SERIALDASH_WIDGET_FACTORY(select, "select")
  SERIALDASH_WIDGET_FACTORY(text, "text")
  SERIALDASH_WIDGET_FACTORY(color, "color")

  /// Partial update of an existing widget's properties (`u`, LIB-TX-06).
  /// `id`/`k` cannot be changed this way.
  template <typename TId>
  serialdash::UpdateBuilder update(TId id) {
    return serialdash::UpdateBuilder(_stream, id);
  }

  /// Removes one widget (`x` with `id`).
  template <typename TId>
  void remove(TId id) {
    _stream.print(F("@{\"t\":\"x\",\"id\":"));
    serialdash::internal::writeRawId(_stream, id);
    _stream.print(F("}\n"));
  }

  /// Removes every widget declared by this device (`x` with no `id`).
  void removeAll() { _stream.print(F("@{\"t\":\"x\"}\n")); }

  // ---- Sending data (§6.4 LIB-TX-10/11) ----

  /// Starts a `d` message spanning possibly several channels:
  /// `dash.data().add("a", 1).add("b", 2);`. See `DataBuilder`.
  serialdash::DataBuilder data() { return serialdash::DataBuilder(_stream); }

  /// Single-channel shortcut for `data().add(channel, value)`.
  template <typename TCh>
  void send(TCh channel, int v) {
    serialdash::DataBuilder(_stream).add(channel, v);
  }
  template <typename TCh>
  void send(TCh channel, long v) {
    serialdash::DataBuilder(_stream).add(channel, v);
  }
  template <typename TCh>
  void send(TCh channel, unsigned int v) {
    serialdash::DataBuilder(_stream).add(channel, v);
  }
  template <typename TCh>
  void send(TCh channel, unsigned long v) {
    serialdash::DataBuilder(_stream).add(channel, v);
  }
  template <typename TCh>
  void send(TCh channel, double v, uint8_t decimals = SERIALDASH_FLOAT_DECIMALS) {
    serialdash::DataBuilder(_stream).add(channel, v, decimals);
  }
  // See DataBuilder::add(TCh, float, ...) — same exact-template-match-wins
  // reasoning requires this explicit `float` overload alongside `double`.
  template <typename TCh>
  void send(TCh channel, float v, uint8_t decimals = SERIALDASH_FLOAT_DECIMALS) {
    serialdash::DataBuilder(_stream).add(channel, v, decimals);
  }
  template <typename TCh>
  void send(TCh channel, bool v) {
    serialdash::DataBuilder(_stream).add(channel, v);
  }
  template <typename TCh, typename TText>
  void send(TCh channel, TText text) {
    serialdash::DataBuilder(_stream).add(channel, text);
  }

  /// `[x, y]` pair shortcut, for `xy`/`polar` widgets.
  template <typename TCh>
  void sendXY(TCh channel, double x, double y, uint8_t decimals = SERIALDASH_FLOAT_DECIMALS) {
    serialdash::DataBuilder(_stream).addXY(channel, x, y, decimals);
  }

  /// Raw array shortcut, for `heat`/`bar` (spectrum) widgets — takes a
  /// pointer + length so no intermediate container is ever built.
  template <typename TCh>
  void sendArray(TCh channel, const float* values, size_t count,
                 uint8_t decimals = SERIALDASH_FLOAT_DECIMALS) {
    serialdash::DataBuilder(_stream).addArray(channel, values, count, decimals);
  }
  template <typename TCh>
  void sendArray(TCh channel, const int16_t* values, size_t count) {
    serialdash::DataBuilder(_stream).addArray(channel, values, count);
  }
  template <typename TCh>
  void sendArray(TCh channel, const uint8_t* values, size_t count) {
    serialdash::DataBuilder(_stream).addArray(channel, values, count);
  }

  // ---- Events (§3.3 "e") ----

  /// Sends a structured log event at the given level, shown in the console
  /// and in `log` widgets. `src` is an optional origin string for filtering.
  template <typename TText>
  void debug(TText msg, const char* src = nullptr) {
    event(F("debug"), msg, src);
  }
  template <typename TText>
  void info(TText msg, const char* src = nullptr) {
    event(F("info"), msg, src);
  }
  template <typename TText>
  void warn(TText msg, const char* src = nullptr) {
    event(F("warn"), msg, src);
  }
  template <typename TText>
  void error(TText msg, const char* src = nullptr) {
    event(F("err"), msg, src);
  }

#ifndef __AVR__
  /// printf-style variants, available on platforms with enough RAM to spare
  /// a 128-byte stack buffer for formatting (§6.4).
  void debugf(const char* fmt, ...) __attribute__((format(printf, 2, 3)));
  void infof(const char* fmt, ...) __attribute__((format(printf, 2, 3)));
  void warnf(const char* fmt, ...) __attribute__((format(printf, 2, 3)));
  void errorf(const char* fmt, ...) __attribute__((format(printf, 2, 3)));
#endif

 private:
  Stream& _stream;
  void (*_onDeclare)() = nullptr;

  template <typename TName, typename TFw>
  void beginImpl(TName name, TFw fw) {
    _stream.print(F("@{\"t\":\"hi\",\"v\":1,\"name\":"));
    serialdash::internal::writeEscapedString(_stream, name);
    if (fw != nullptr) {
      _stream.print(F(",\"fw\":"));
      serialdash::internal::writeEscapedString(_stream, fw);
    }
    _stream.print(F(",\"rx\":"));
    _stream.print(static_cast<unsigned long>(SERIALDASH_RX_BUFFER));
    _stream.print(F("}\n"));
    if (_onDeclare != nullptr) _onDeclare();
  }

  template <typename TLevel, typename TText>
  void event(TLevel lvl, TText msg, const char* src) {
    _stream.print(F("@{\"t\":\"e\",\"lvl\":\""));
    _stream.print(lvl);
    _stream.print(F("\",\"msg\":"));
    serialdash::internal::writeEscapedString(_stream, msg);
    if (src != nullptr) {
      _stream.print(F(",\"src\":"));
      serialdash::internal::writeEscapedString(_stream, src);
    }
    _stream.print(F("}\n"));
  }

#ifndef __AVR__
  void eventf(const char* lvl, const char* fmt, va_list args);
#endif
};
