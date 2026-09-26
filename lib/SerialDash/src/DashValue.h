#pragma once

#include <Arduino.h>
#include <stdlib.h>
#include <string.h>

#include "internal/JsonParser.h"
#include "internal/JsonWriter.h"

/**
 * A control's incoming value, passed by reference to `onControl`/`onAnyControl` callbacks
 * (SPEC.md §6.5 LIB-CTL-02). Wraps whatever the app sent in `c`'s `v` field with tolerant
 * conversions (`toBool()` on a nonzero number is `true`, etc.) — the callback decides what type
 * makes sense for its own control, per §4.3.
 *
 * `toString()`'s pointer (and the value generally) is only valid for the duration of the
 * callback: it points into the library's one shared receive line buffer, which the next line
 * read will overwrite.
 */
class DashValue {
 public:
  enum class Type : uint8_t { Number, Bool, String, Null };

  Type type() const { return _type; }
  bool isNumber() const { return _type == Type::Number; }
  bool isBool() const { return _type == Type::Bool; }
  bool isString() const { return _type == Type::String; }
  bool isNull() const { return _type == Type::Null; }

  int toInt() const { return static_cast<int>(toLong()); }

  long toLong() const {
    switch (_type) {
      case Type::Number:
        return static_cast<long>(_number);
      case Type::Bool:
        return _boolean ? 1 : 0;
      case Type::String:
        return _text != nullptr ? atol(_text) : 0;
      default:
        return 0;
    }
  }

  float toFloat() const {
    switch (_type) {
      case Type::Number:
        return static_cast<float>(_number);
      case Type::Bool:
        return _boolean ? 1.0f : 0.0f;
      case Type::String:
        return _text != nullptr ? static_cast<float>(atof(_text)) : 0.0f;
      default:
        return 0.0f;
    }
  }

  bool toBool() const {
    switch (_type) {
      case Type::Number:
        return _number != 0;
      case Type::Bool:
        return _boolean;
      case Type::String:
        return _text != nullptr && _text[0] != '\0' && strcmp(_text, "false") != 0 &&
               strcmp(_text, "0") != 0;
      default:
        return false;
    }
  }

  /// Valid only when `isString()` (and only for the duration of the callback — see class doc).
  const char* toString() const { return _text; }

  bool equals(const char* other) const { return _text != nullptr && strcmp(_text, other) == 0; }

  /// Replaces the value echoed back to the app after a successful control (LIB-CTL-03) — e.g.
  /// clamping a slider's requested value to what was actually applied.
  void set(int v) { set(static_cast<double>(v)); }
  void set(long v) { set(static_cast<double>(v)); }
  void set(double v) {
    _type = Type::Number;
    _number = v;
  }
  void set(bool v) {
    _type = Type::Bool;
    _boolean = v;
  }
  void set(const char* v) {
    _type = Type::String;
    _text = v;
    _textIsFlash = false;
  }
  void set(const __FlashStringHelper* v) {
    _type = Type::String;
    _text = reinterpret_cast<const char*>(v);
    _textIsFlash = true;
  }

  /// Rejects the control (LIB-CTL-03): `ack` will carry `ok:false` and this message as `err`,
  /// and no echo `d` is sent. Always returns `false`, so a callback can `return v.reject(...)`.
  bool reject(const char* msg) {
    _errorMessage = msg;
    _errorIsFlash = false;
    return false;
  }
  bool reject(const __FlashStringHelper* msg) {
    _errorMessage = reinterpret_cast<const char*>(msg);
    _errorIsFlash = true;
    return false;
  }

  bool hasErrorMessage() const { return _errorMessage != nullptr; }

  void writeErrorMessage(Print& out) const {
    if (_errorIsFlash) {
      serialdash::internal::writeEscapedString(
          out, reinterpret_cast<const __FlashStringHelper*>(_errorMessage));
    } else {
      serialdash::internal::writeEscapedString(out, _errorMessage);
    }
  }

  /// Writes the current value as a bare JSON value — used for the echo `d` after a successful
  /// control (LIB-CTL-04).
  void writeValue(Print& out) const {
    switch (_type) {
      case Type::Number:
        serialdash::internal::writeFloat(out, _number, SERIALDASH_FLOAT_DECIMALS);
        return;
      case Type::Bool:
        serialdash::internal::writeBool(out, _boolean);
        return;
      case Type::String:
        if (_textIsFlash) {
          serialdash::internal::writeEscapedString(
              out, reinterpret_cast<const __FlashStringHelper*>(_text));
        } else {
          serialdash::internal::writeEscapedString(out, _text);
        }
        return;
      case Type::Null:
        out.print(F("null"));
        return;
    }
  }

  /// Populates from a just-parsed wire field (`c`'s `v`) — internal, not part of the public API.
  void setFromField(const serialdash::internal::Field& f) {
    switch (f.type) {
      case serialdash::internal::FieldType::Number:
        _type = Type::Number;
        _number = f.number;
        break;
      case serialdash::internal::FieldType::Bool:
        _type = Type::Bool;
        _boolean = f.boolean;
        break;
      case serialdash::internal::FieldType::String:
        _type = Type::String;
        _text = f.text;
        _textIsFlash = false;
        break;
      default:
        _type = Type::Null;
        break;
    }
  }

 private:
  Type _type = Type::Null;
  double _number = 0;
  bool _boolean = false;
  const char* _text = nullptr;
  bool _textIsFlash = false;
  const char* _errorMessage = nullptr;
  bool _errorIsFlash = false;
};
