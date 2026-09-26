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

#include "DashValue.h"
#include "internal/DataBuilder.h"
#include "internal/JsonParser.h"
#include "internal/JsonWriter.h"
#include "internal/LineBuffer.h"
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

  /// Must be called on every pass of the sketch's `loop()`: reads whatever bytes are available
  /// from the Stream, accumulates them into a line (LIB-RX-01), and dispatches complete lines —
  /// `hi`/`ping`/`c` handled automatically (LIB-RX-06), free text handed to `onText` if
  /// registered (LIB-RX-05), a too-long line reported as an `rx overflow` event (LIB-RX-04).
  void loop() {
    while (_stream.available() > 0) {
      char c = static_cast<char>(_stream.read());
      if (_rxBuffer.feed(c)) {
        handleLine();
        _rxBuffer.reset();
      }
    }
  }

  /// Registers the callback that declares widgets and invokes it immediately. Also re-invoked
  /// every time the app asks the device to redeclare (an app-sent `hi`, PRT-20) — a board reset
  /// isn't the only time widgets need to be re-sent; the app can request it any time (e.g. after
  /// reconnecting to a board it briefly lost sync with).
  void onDeclare(void (*cb)()) {
    _onDeclare = cb;
    if (_onDeclare != nullptr) _onDeclare();
  }

  /// Whether the app is known to be listening (SPEC.md §3.5 rule 5): a `hi` has been received
  /// from it at least once, and a `ping` arrived within the last 5s. `millis()` wraparound
  /// (~49 days) is handled by the unsigned subtraction below, the standard Arduino idiom.
  bool appConnected() const {
    return _appHiReceived && _everPinged && (millis() - _lastPingAtMs < 5000UL);
  }

  // ---- Controls (§6.5) ----

  /// Registers the callback for one control's id (PRT-13: a control's `id` doubles as its state
  /// channel). Overload set covers both `const char*` and `F()` ids (LIB-GEN-09) — `F()` ids are
  /// matched against the incoming (always RAM-resident) id byte-by-byte via `pgm_read_byte`,
  /// same technique `internal::writeEscapedString` already uses for flash strings on output.
  void onControl(const char* id, bool (*callback)(DashValue&)) {
    if (_controlCount < SERIALDASH_MAX_CONTROLS) {
      _controls[_controlCount++] = ControlBinding(id, false, callback);
    }
  }
  void onControl(const __FlashStringHelper* id, bool (*callback)(DashValue&)) {
    if (_controlCount < SERIALDASH_MAX_CONTROLS) {
      _controls[_controlCount++] =
          ControlBinding(reinterpret_cast<const char*>(id), true, callback);
    }
  }

  /// Fallback for any control id without its own `onControl` (LIB-RX-07 only applies when even
  /// this isn't registered).
  void onAnyControl(bool (*callback)(const char*, DashValue&)) { _onAnyControl = callback; }

  /// Registers the callback for free-text lines — ones not starting with `@{` (LIB-RX-05),
  /// letting a sketch keep its own pre-existing text command handling alongside the protocol.
  void onText(void (*callback)(const char*)) { _onText = callback; }

  /// Disables the automatic echo `d` sent after a control is *accepted* (LIB-CTL-04), for
  /// sketches that want to send the applied value by hand instead — e.g. because it depends on
  /// a sensor reading taken slightly later, not just the requested value. `ack` itself is always
  /// sent regardless: the app's pending-control state machine (§3.6) depends on it arriving.
  void setAutoEcho(bool enabled) { _autoEcho = enabled; }

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
  /// A `const char*`/`F()` string remembered for later (here: `begin()`'s `name`/`fw`, needed
  /// again every time the app asks for a redeclare) without copying it — costs one pointer plus
  /// a type tag, versus the ~100+ bytes a rendered-and-cached copy of the whole `hi` line would
  /// cost, which would eat deep into LIB-GEN-07's 150-byte RAM budget for no real benefit (the
  /// original `name`/`fw` a sketch passes in are always either string literals or `F()` — both
  /// live for the sketch's whole lifetime anyway).
  // A user-declared constructor here is required, not just style: with a default member
  // initializer (`= nullptr`) but no constructor, this struct stops being an aggregate under
  // C++11 (that restriction only relaxes in C++14) — brace-init call sites below would fail to
  // compile under LIB-GEN-10's mandated C++11 standard.
  struct StoredText {
    const char* ptr;
    bool isFlash;
    StoredText() : ptr(nullptr), isFlash(false) {}
    StoredText(const char* p, bool flash) : ptr(p), isFlash(flash) {}
  };
  static StoredText storeText(const char* v) { return StoredText(v, false); }
  static StoredText storeText(const __FlashStringHelper* v) {
    return StoredText(reinterpret_cast<const char*>(v), true);
  }
  void writeStoredText(const StoredText& t) const {
    if (t.ptr == nullptr) return;
    if (t.isFlash) {
      serialdash::internal::writeEscapedString(_stream,
                                               reinterpret_cast<const __FlashStringHelper*>(t.ptr));
    } else {
      serialdash::internal::writeEscapedString(_stream, t.ptr);
    }
  }

  // Same reasoning as StoredText above: a real constructor, not NSDMI, so this stays usable with
  // C++11's stricter aggregate rules.
  struct ControlBinding {
    const char* id;
    bool idIsFlash;
    bool (*callback)(DashValue&);
    ControlBinding() : id(nullptr), idIsFlash(false), callback(nullptr) {}
    ControlBinding(const char* i, bool flash, bool (*cb)(DashValue&))
        : id(i), idIsFlash(flash), callback(cb) {}
  };

  Stream& _stream;
  void (*_onDeclare)() = nullptr;
  void (*_onText)(const char*) = nullptr;
  bool (*_onAnyControl)(const char*, DashValue&) = nullptr;
  ControlBinding _controls[SERIALDASH_MAX_CONTROLS];
  uint8_t _controlCount = 0;
  bool _autoEcho = true;

  StoredText _name;
  StoredText _fw;
  serialdash::internal::LineBuffer _rxBuffer;
  bool _appHiReceived = false;
  bool _everPinged = false;
  unsigned long _lastPingAtMs = 0;

  template <typename TName, typename TFw>
  void beginImpl(TName name, TFw fw) {
    _name = storeText(name);
    _fw = storeText(fw);
    sendHi();
    if (_onDeclare != nullptr) _onDeclare();
  }

  void sendHi() {
    _stream.print(F("@{\"t\":\"hi\",\"v\":1,\"name\":"));
    writeStoredText(_name);
    if (_fw.ptr != nullptr) {
      _stream.print(F(",\"fw\":"));
      writeStoredText(_fw);
    }
    _stream.print(F(",\"rx\":"));
    _stream.print(static_cast<unsigned long>(SERIALDASH_RX_BUFFER));
    _stream.print(F("}\n"));
  }

  static bool controlIdMatches(const ControlBinding& binding, const char* incomingId) {
    if (!binding.idIsFlash) return strcmp(binding.id, incomingId) == 0;
    PGM_P flashPtr = reinterpret_cast<PGM_P>(binding.id);
    const char* p = incomingId;
    for (;;) {
      char fc = static_cast<char>(pgm_read_byte(flashPtr));
      if (fc != *p) return false;
      if (fc == '\0') return true;
      ++flashPtr;
      ++p;
    }
  }

  void sendAck(long r, bool ok, const DashValue* value) {
    _stream.print(F("@{\"t\":\"ack\",\"r\":"));
    _stream.print(r);
    _stream.print(F(",\"ok\":"));
    serialdash::internal::writeBool(_stream, ok);
    if (!ok && value != nullptr && value->hasErrorMessage()) {
      _stream.print(F(",\"err\":"));
      value->writeErrorMessage(_stream);
    }
    _stream.print(F("}\n"));
  }

  void handleControl(const serialdash::internal::Field* fields, uint8_t count) {
    const serialdash::internal::Field* rField = serialdash::internal::findField(fields, count, "r");
    const serialdash::internal::Field* idField =
        serialdash::internal::findField(fields, count, "id");
    if (rField == nullptr || rField->type != serialdash::internal::FieldType::Number) return;
    if (idField == nullptr || idField->type != serialdash::internal::FieldType::String) return;
    long r = static_cast<long>(rField->number);

    DashValue value;
    const serialdash::internal::Field* vField = serialdash::internal::findField(fields, count, "v");
    if (vField != nullptr) value.setFromField(*vField);

    bool (*callback)(DashValue&) = nullptr;
    for (uint8_t i = 0; i < _controlCount; ++i) {
      if (controlIdMatches(_controls[i], idField->text)) {
        callback = _controls[i].callback;
        break;
      }
    }

    bool ok;
    if (callback != nullptr) {
      ok = callback(value);
    } else if (_onAnyControl != nullptr) {
      ok = _onAnyControl(idField->text, value);
    } else {
      // LIB-RX-07: nothing registered for this id at all (neither onControl nor onAnyControl).
      _stream.print(F("@{\"t\":\"ack\",\"r\":"));
      _stream.print(r);
      _stream.print(F(",\"ok\":false,\"err\":\"unknown control\"}\n"));
      return;
    }

    // ack is always sent — the app's pending-control state machine (§3.6) depends on it. Only
    // the value echo below is what `setAutoEcho(false)` opts out of (LIB-CTL-04).
    sendAck(r, ok, &value);
    if (ok && _autoEcho) {
      _stream.print(F("@{\"t\":\"d\",\"d\":{"));
      serialdash::internal::writeRawId(_stream, idField->text);
      _stream.print(':');
      value.writeValue(_stream);
      _stream.print(F("}}\n"));
    }
  }

  void handleLine() {
    if (_rxBuffer.overflowed()) {
      _stream.print(F("@{\"t\":\"e\",\"lvl\":\"err\",\"msg\":\"rx overflow\",\"src\":\"dash\"}\n"));
      return;
    }
    char* line = _rxBuffer.line();
    if (line[0] != '@' || line[1] != '{') {
      if (_onText != nullptr) _onText(line);
      return;
    }

    serialdash::internal::Field fields[6];  // t,r,id,v is the largest a2d message (PRT-40)
    uint8_t count = serialdash::internal::parseFlatObject(line + 1, fields, 6);
    const serialdash::internal::Field* tField = serialdash::internal::findField(fields, count, "t");
    if (tField == nullptr || tField->type != serialdash::internal::FieldType::String) return;

    if (strcmp(tField->text, "hi") == 0) {
      _appHiReceived = true;
      sendHi();
      if (_onDeclare != nullptr) _onDeclare();
    } else if (strcmp(tField->text, "ping") == 0) {
      _everPinged = true;
      _lastPingAtMs = millis();
      const serialdash::internal::Field* rField =
          serialdash::internal::findField(fields, count, "r");
      if (rField != nullptr && rField->type == serialdash::internal::FieldType::Number) {
        _stream.print(F("@{\"t\":\"pong\",\"r\":"));
        _stream.print(static_cast<long>(rField->number));
        _stream.print(F("}\n"));
      }
    } else if (strcmp(tField->text, "c") == 0) {
      handleControl(fields, count);
    }
    // unknown t: ignored (LIB-RX-06)
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
