#pragma once

#include <Arduino.h>
#include <stddef.h>
#include <stdint.h>

#include "JsonWriter.h"

#ifndef SERIALDASH_FLOAT_DECIMALS
#define SERIALDASH_FLOAT_DECIMALS 3
#endif

namespace serialdash {

/**
 * Streaming builder for a `d` data message (SPEC.md §3.3 "d", §6.4 LIB-TX-10).
 *
 * `dash.data()` returns one of these; each `.add(channel, value)` call writes
 * one more `"channel":value` entry into the message's `d` object, opening it
 * on the first call and keeping it open across the chain. `.map(channel)`
 * instead opens a nested label->value object for that one channel, filled by
 * consecutive `.kv(label, value)` calls until a non-`kv` method (or the end
 * of the statement) closes it — the same "streams straight to the wire, no
 * buffering" design as WidgetBuilder, so a `data()` chain must be one
 * statement for the same reason.
 *
 * `SerialDash::send()`/`sendXY()`/`sendArray()` are thin single-channel
 * convenience wrappers built on top of this same class.
 */
class DataBuilder {
 public:
  explicit DataBuilder(Print& out) : _out(&out) { _out->print(F("@{\"t\":\"d\"")); }

  DataBuilder(DataBuilder&& other) noexcept
      : _out(other._out),
        _hasTs(other._hasTs),
        _pendingTs(other._pendingTs),
        _dOpen(other._dOpen),
        _mapOpen(other._mapOpen) {
    other._out = nullptr;
  }
  DataBuilder(const DataBuilder&) = delete;
  DataBuilder& operator=(const DataBuilder&) = delete;
  DataBuilder& operator=(DataBuilder&&) = delete;

  ~DataBuilder();

  /// Device timestamp in ms, typically `millis()` (PRT-30/31). Buffered
  /// (just one `unsigned long`, no allocation) and written by the
  /// destructor instead of immediately: unlike every other property here,
  /// `ts` has no natural "inside an open object" position of its own — it
  /// sits next to `d`, not inside it — so writing it the same way as
  /// everything else would corrupt the `d` object if `.ts()` is called
  /// after any `.add()`/`.map()` (it would land as a bogus extra channel
  /// instead of a sibling field). Buffering sidesteps that regardless of
  /// where `.ts()` appears in the chain.
  DataBuilder& ts(unsigned long ms) {
    _hasTs = true;
    _pendingTs = ms;
    return *this;
  }

  // ---- add(channel, value) — one channel -> scalar value per call ----

  /// Adds one `"channel":value` entry to the message's `d` object. Overloaded
  /// for every scalar a channel can carry (int/long/unsigned/double/bool/
  /// Text, LIB-TX-10) — the same overload set as `SerialDash::send()`, which
  /// this class is what actually implements it in terms of.
  template <typename TCh>
  DataBuilder& add(TCh channel, int v) {
    beginAdd(channel);
    internal::writeInt(*_out, v);
    return *this;
  }
  template <typename TCh>
  DataBuilder& add(TCh channel, long v) {
    beginAdd(channel);
    internal::writeInt(*_out, v);
    return *this;
  }
  template <typename TCh>
  DataBuilder& add(TCh channel, unsigned int v) {
    beginAdd(channel);
    internal::writeUInt(*_out, v);
    return *this;
  }
  template <typename TCh>
  DataBuilder& add(TCh channel, unsigned long v) {
    beginAdd(channel);
    internal::writeUInt(*_out, v);
    return *this;
  }
  template <typename TCh>
  DataBuilder& add(TCh channel, double v, uint8_t decimals = SERIALDASH_FLOAT_DECIMALS) {
    beginAdd(channel);
    internal::writeFloat(*_out, v, decimals);
    return *this;
  }
  // A `float` overload is needed alongside `double`: with only `double` plus
  // the generic `add(TCh, TText)` below, a `float` argument would resolve to
  // the TText template (exact type match) instead of `double` (which needs a
  // widening conversion) — an exact template match beats a non-template
  // overload that requires any conversion, however trivial.
  template <typename TCh>
  DataBuilder& add(TCh channel, float v, uint8_t decimals = SERIALDASH_FLOAT_DECIMALS) {
    return add(channel, static_cast<double>(v), decimals);
  }
  template <typename TCh>
  DataBuilder& add(TCh channel, bool v) {
    beginAdd(channel);
    internal::writeBool(*_out, v);
    return *this;
  }
  template <typename TCh, typename TText>
  DataBuilder& add(TCh channel, TText text) {
    beginAdd(channel);
    internal::writeEscapedString(*_out, text);
    return *this;
  }

  /// `[x, y]` pair, for `xy`/`polar` widgets.
  template <typename TCh>
  DataBuilder& addXY(TCh channel, double x, double y,
                     uint8_t decimals = SERIALDASH_FLOAT_DECIMALS) {
    beginAdd(channel);
    _out->print('[');
    internal::writeFloat(*_out, x, decimals);
    _out->print(',');
    internal::writeFloat(*_out, y, decimals);
    _out->print(']');
    return *this;
  }

  /// A raw array of numbers, for `heat`/`bar` (spectrum) widgets — the
  /// pointer + length form required by LIB-TX (`sendArray`) so no
  /// intermediate container is ever allocated.
  template <typename TCh>
  DataBuilder& addArray(TCh channel, const float* values, size_t count,
                        uint8_t decimals = SERIALDASH_FLOAT_DECIMALS) {
    beginAdd(channel);
    _out->print('[');
    for (size_t i = 0; i < count; ++i) {
      if (i > 0) _out->print(',');
      internal::writeFloat(*_out, values[i], decimals);
    }
    _out->print(']');
    return *this;
  }
  template <typename TCh>
  DataBuilder& addArray(TCh channel, const int16_t* values, size_t count) {
    beginAdd(channel);
    _out->print('[');
    for (size_t i = 0; i < count; ++i) {
      if (i > 0) _out->print(',');
      internal::writeInt(*_out, values[i]);
    }
    _out->print(']');
    return *this;
  }
  template <typename TCh>
  DataBuilder& addArray(TCh channel, const uint8_t* values, size_t count) {
    beginAdd(channel);
    _out->print('[');
    for (size_t i = 0; i < count; ++i) {
      if (i > 0) _out->print(',');
      internal::writeUInt(*_out, values[i]);
    }
    _out->print(']');
    return *this;
  }

  // ---- map(channel).kv(label, value)... — one channel -> label:value object ----

  /// Opens a nested label->value object for one channel (for `pie`/`bar`/
  /// `table` widgets fed an object rather than a bare number), closed by the
  /// next non-`kv()` call or the end of the statement — filled with `kv()`.
  template <typename TCh>
  DataBuilder& map(TCh channel) {
    beginAdd(channel);
    _out->print('{');
    _mapOpen = true;
    _mapFirst = true;
    return *this;
  }

  /// One `label:value` entry inside a `map()`. Same scalar overload set as
  /// `add()`.
  template <typename TLabel>
  DataBuilder& kv(TLabel label, int v) {
    beginKv(label);
    internal::writeInt(*_out, v);
    return *this;
  }
  template <typename TLabel>
  DataBuilder& kv(TLabel label, long v) {
    beginKv(label);
    internal::writeInt(*_out, v);
    return *this;
  }
  template <typename TLabel>
  DataBuilder& kv(TLabel label, unsigned int v) {
    beginKv(label);
    internal::writeUInt(*_out, v);
    return *this;
  }
  template <typename TLabel>
  DataBuilder& kv(TLabel label, unsigned long v) {
    beginKv(label);
    internal::writeUInt(*_out, v);
    return *this;
  }
  template <typename TLabel>
  DataBuilder& kv(TLabel label, double v, uint8_t decimals = SERIALDASH_FLOAT_DECIMALS) {
    beginKv(label);
    internal::writeFloat(*_out, v, decimals);
    return *this;
  }
  // See the `add(TCh, float, ...)` comment above — same reasoning applies.
  template <typename TLabel>
  DataBuilder& kv(TLabel label, float v, uint8_t decimals = SERIALDASH_FLOAT_DECIMALS) {
    return kv(label, static_cast<double>(v), decimals);
  }
  template <typename TLabel>
  DataBuilder& kv(TLabel label, bool v) {
    beginKv(label);
    internal::writeBool(*_out, v);
    return *this;
  }
  template <typename TLabel, typename TText>
  DataBuilder& kv(TLabel label, TText text) {
    beginKv(label);
    internal::writeEscapedString(*_out, text);
    return *this;
  }

 private:
  Print* _out;
  bool _hasTs = false;
  unsigned long _pendingTs = 0;
  bool _dOpen = false;
  bool _mapOpen = false;
  bool _mapFirst = true;

  template <typename TCh>
  void beginAdd(TCh channel) {
    if (_mapOpen) {
      _out->print('}');
      _mapOpen = false;
    }
    if (!_dOpen) {
      _out->print(F(",\"d\":{"));
      _dOpen = true;
    } else {
      _out->print(',');
    }
    internal::writeRawId(*_out, channel);
    _out->print(':');
  }

  template <typename TLabel>
  void beginKv(TLabel label) {
    if (!_mapFirst) _out->print(',');
    _mapFirst = false;
    internal::writeEscapedString(*_out, label);
    _out->print(':');
  }
};

}  // namespace serialdash
