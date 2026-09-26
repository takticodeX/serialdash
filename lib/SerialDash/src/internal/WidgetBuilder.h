#pragma once

#include <Arduino.h>

#include "JsonWriter.h"

#ifndef SERIALDASH_FLOAT_DECIMALS
#define SERIALDASH_FLOAT_DECIMALS 3
#endif

namespace serialdash {

/**
 * Holds every widget/update property setter (SPEC.md §6.4 LIB-TX-02..05) and
 * the streaming/array-bookkeeping machinery they share. Not used directly —
 * `WidgetBuilder` (a `w` declaration) and `UpdateBuilder` (a `u` partial
 * update) each add only the couple of bytes of envelope that differ between
 * the two message types, then inherit this entire property surface, since a
 * `u` message accepts the same properties as `w` (SPEC.md §3.3 "u"), just
 * merged into an existing declaration instead of starting a new one.
 *
 * Every setter writes directly to the underlying `Print` (the device's
 * `Stream`) as soon as it is called and returns `*this` so calls can be
 * chained; nothing is ever buffered in RAM. The destructor closes any
 * still-open array/object property and terminates the line with `}\n` — so a
 * declaration like `dash.line("t").ch("a");` must be written as one
 * statement: the line is only flushed when the temporary is destroyed at the
 * end of the full expression.
 *
 * Move-only (streaming to a `Stream` cannot be safely copied); normally never
 * named directly by user code.
 */
class PropertyWriter {
 public:
  explicit PropertyWriter(Print& out) : _out(&out) {}

  PropertyWriter(PropertyWriter&& other) noexcept
      : _out(other._out), _openArray(other._openArray), _openClose(other._openClose) {
    other._out = nullptr;  // moved-from: destructor becomes a no-op
  }
  PropertyWriter(const PropertyWriter&) = delete;
  PropertyWriter& operator=(const PropertyWriter&) = delete;
  PropertyWriter& operator=(PropertyWriter&&) = delete;

  /// Closes any open array/object property and terminates the line.
  ~PropertyWriter();

  // ---- Common properties, every widget kind (LIB-TX-02) ----

  template <typename TText>
  PropertyWriter& title(TText text) {
    beginField(F("title"));
    internal::writeEscapedString(*_out, text);
    return *this;
  }

  /// Single channel: `"ch":"id"`. See the two-or-more-argument overload
  /// below for multi-channel widgets, which writes `"ch":["a","b",...]`
  /// instead (SPEC.md's `channels` schema accepts both forms).
  template <typename TId>
  PropertyWriter& ch(TId id) {
    beginField(F("ch"));
    internal::writeRawId(*_out, id);
    return *this;
  }
  template <typename TId, typename... TRest>
  PropertyWriter& ch(TId id, TRest... rest) {
    beginField(F("ch"));
    _out->print('[');
    internal::writeRawId(*_out, id);
    writeIdListRest(rest...);
    _out->print(']');
    return *this;
  }

  template <typename... TText>
  PropertyWriter& labels(TText... texts) {
    beginField(F("labels"));
    _out->print('[');
    writeStringListFirst(texts...);
    _out->print(']');
    return *this;
  }

  template <typename... TText>
  PropertyWriter& colors(TText... hexColors) {
    beginField(F("colors"));
    _out->print('[');
    writeStringListFirst(hexColors...);
    _out->print(']');
    return *this;
  }

  template <typename TText>
  PropertyWriter& group(TText name) {
    beginField(F("grp"));
    internal::writeEscapedString(*_out, name);
    return *this;
  }

  /// Initial placement order within the widget's group (`ord`).
  PropertyWriter& order(long ord);
  /// Suggested size in 12-column grid cells (`size: [w, h]`).
  PropertyWriter& size(uint8_t widthCells, uint8_t heightCells);

  template <typename TText>
  PropertyWriter& unit(TText u) {
    beginField(F("unit"));
    internal::writeEscapedString(*_out, u);
    return *this;
  }

  /// Decimal places to display, 0-6 (`dec`).
  PropertyWriter& decimals(uint8_t n);

  /// Seconds before the widget is shown as "stale" (default 5, §4.1's
  /// common `stale` property).
  PropertyWriter& stale(double seconds);

  /// `min`/`max` — used as-is by line/gauge/level/slider/number (all share
  /// the same two protocol field names regardless of kind).
  PropertyWriter& range(double lo, double hi);

  /// Marks a control disabled in the UI (`dis`).
  PropertyWriter& disabled();

  template <typename TText>
  PropertyWriter& confirm(TText text) {
    beginField(F("confirm"));
    internal::writeEscapedString(*_out, text);
    return *this;
  }

  // `value(v)` -> `"val"`. Overloaded for every scalar type a channel can
  // carry (int/long/unsigned/double/bool/Text) per the same convention as
  // `SerialDash::send()` (LIB-TX-10).
  PropertyWriter& value(int v);
  PropertyWriter& value(long v);
  PropertyWriter& value(unsigned int v);
  PropertyWriter& value(unsigned long v);
  PropertyWriter& value(double v, uint8_t decimalPlaces = SERIALDASH_FLOAT_DECIMALS);
  // A `float` overload is needed alongside `double` above: with only a
  // `double` overload plus the generic `TText` one below, a `float` argument
  // would resolve to the TText template (exact type match) instead of
  // `double` (which needs a widening conversion) — an exact template match
  // beats a non-template overload that requires any conversion, however
  // trivial. Delegates straight to the `double` version.
  PropertyWriter& value(float v, uint8_t decimalPlaces = SERIALDASH_FLOAT_DECIMALS) {
    return value(static_cast<double>(v), decimalPlaces);
  }
  PropertyWriter& value(bool v);
  template <typename TText>
  PropertyWriter& value(TText text) {
    beginField(F("val"));
    internal::writeEscapedString(*_out, text);
    return *this;
  }

  // ---- Escape hatch for properties without a dedicated method (LIB-TX-05) ----

  template <typename TKey>
  PropertyWriter& prop(TKey key, int v) {
    beginUserField(key);
    internal::writeInt(*_out, v);
    return *this;
  }
  template <typename TKey>
  PropertyWriter& prop(TKey key, long v) {
    beginUserField(key);
    internal::writeInt(*_out, v);
    return *this;
  }
  template <typename TKey>
  PropertyWriter& prop(TKey key, unsigned int v) {
    beginUserField(key);
    internal::writeUInt(*_out, v);
    return *this;
  }
  template <typename TKey>
  PropertyWriter& prop(TKey key, unsigned long v) {
    beginUserField(key);
    internal::writeUInt(*_out, v);
    return *this;
  }
  template <typename TKey>
  PropertyWriter& prop(TKey key, double v, uint8_t decimalPlaces = SERIALDASH_FLOAT_DECIMALS) {
    beginUserField(key);
    internal::writeFloat(*_out, v, decimalPlaces);
    return *this;
  }
  // See the `value(float, ...)` comment above — same reasoning applies here.
  template <typename TKey>
  PropertyWriter& prop(TKey key, float v, uint8_t decimalPlaces = SERIALDASH_FLOAT_DECIMALS) {
    return prop(key, static_cast<double>(v), decimalPlaces);
  }
  template <typename TKey>
  PropertyWriter& prop(TKey key, bool v) {
    beginUserField(key);
    internal::writeBool(*_out, v);
    return *this;
  }
  template <typename TKey, typename TText>
  PropertyWriter& prop(TKey key, TText text) {
    beginUserField(key);
    internal::writeEscapedString(*_out, text);
    return *this;
  }

  // ---- Kind-specific named properties (LIB-TX-03), grouped by widget ----

  /// line: window in seconds (`win`).
  PropertyWriter& window(double seconds);
  /// line: stair-step rendering flag (`step`, boolean form).
  PropertyWriter& step(bool stepped = true);
  /// line: fill area under the curve (`fill`).
  PropertyWriter& fill(bool filled = true);

  /// slider/number: numeric increment (`step`, numeric form — same protocol
  /// field as line's boolean `step()` above, kept as a separate method name
  /// since C++ can't overload `step(bool)` next to `step(double)` without an
  /// ambiguous call for plain integer-literal arguments like `step(1)`).
  PropertyWriter& stepSize(double s);

  /// value: trend arrow / session min-max / warn-alarm thresholds.
  PropertyWriter& trend(bool show = true);
  PropertyWriter& minmax(bool show = true);
  PropertyWriter& warn(double lo, double hi);
  PropertyWriter& alarm(double lo, double hi);

  /// led/switch: `on`/`off` — a color (led) or a label (switch); same two
  /// protocol fields either way, so one pair of methods serves both kinds.
  template <typename TText>
  PropertyWriter& on(TText colorOrLabel) {
    beginField(F("on"));
    internal::writeEscapedString(*_out, colorOrLabel);
    return *this;
  }
  template <typename TText>
  PropertyWriter& off(TText colorOrLabel) {
    beginField(F("off"));
    internal::writeEscapedString(*_out, colorOrLabel);
    return *this;
  }

  /// led: one entry of the `states` map (`value -> [label, color]`), built
  /// by consecutive calls the same way `zone()`/`option()` build their
  /// arrays (LIB-TX-04) — except this one is a JSON *object*, not an array.
  template <typename TLabel, typename TColor>
  PropertyWriter& state(int value, TLabel label, TColor color) {
    return state(static_cast<long>(value), label, color);
  }
  template <typename TLabel, typename TColor>
  PropertyWriter& state(bool value, TLabel label, TColor color) {
    return state(static_cast<long>(value), label, color);
  }
  template <typename TLabel, typename TColor>
  PropertyWriter& state(long value, TLabel label, TColor color) {
    beginCollectionEntry(ArrayProp::State, F("states"), '{', '}');
    _out->print('"');
    _out->print(value);
    _out->print(F("\":["));
    internal::writeEscapedString(*_out, label);
    _out->print(',');
    internal::writeEscapedString(*_out, color);
    _out->print(']');
    return *this;
  }
  template <typename TValue, typename TLabel, typename TColor>
  PropertyWriter& state(TValue value, TLabel label, TColor color) {
    beginCollectionEntry(ArrayProp::State, F("states"), '{', '}');
    internal::writeEscapedString(*_out, value);
    _out->print(F(":["));
    internal::writeEscapedString(*_out, label);
    _out->print(',');
    internal::writeEscapedString(*_out, color);
    _out->print(']');
    return *this;
  }

  /// gauge/level: one entry of the `zones` array (`[from, to, color]`),
  /// built by consecutive calls (LIB-TX-04's own example).
  template <typename TColor>
  PropertyWriter& zone(double from, double to, TColor color) {
    beginCollectionEntry(ArrayProp::Zone, F("zones"), '[', ']');
    _out->print('[');
    internal::writeFloat(*_out, from, SERIALDASH_FLOAT_DECIMALS);
    _out->print(',');
    internal::writeFloat(*_out, to, SERIALDASH_FLOAT_DECIMALS);
    _out->print(',');
    internal::writeEscapedString(*_out, color);
    _out->print(']');
    return *this;
  }

  /// level/slider: vertical orientation flag (`vert`).
  PropertyWriter& vert(bool vertical = true);

  /// log: minimum level shown, filtered sources, max rows kept. `max` is
  /// also reused by the `text` control for its max input length — same
  /// protocol field name either way.
  template <typename TText>
  PropertyWriter& minLevel(TText level) {
    beginField(F("lvl"));
    internal::writeEscapedString(*_out, level);
    return *this;
  }
  template <typename... TText>
  PropertyWriter& sources(TText... srcs) {
    beginField(F("src"));
    _out->print('[');
    writeStringListFirst(srcs...);
    _out->print(']');
    return *this;
  }
  // Named `limit`, not `max`: Arduino's AVR core `#define`s a `max(a, b)`
  // macro (and `min`), so a method literally named `max` fails to compile
  // the moment a real Arduino.h is in scope — the token gets macro-expanded
  // before the compiler ever sees it as a method name. Only visible when
  // building against a real board core, not in this library's own native
  // tests, which is exactly how this was caught (`arduino-cli compile`).
  PropertyWriter& limit(long n);

  /// text control: placeholder text (`ph`).
  template <typename TText>
  PropertyWriter& placeholder(TText ph) {
    beginField(F("ph"));
    internal::writeEscapedString(*_out, ph);
    return *this;
  }

  /// pie: donut hole / show percentages.
  PropertyWriter& donut(bool show = true);
  PropertyWriter& pct(bool show = true);

  /// bar: horizontal orientation, per-bar labels for array (spectrum) data.
  PropertyWriter& horiz(bool horizontal = true);
  template <typename... TText>
  PropertyWriter& xlabels(TText... labelsList) {
    beginField(F("xlabels"));
    _out->print('[');
    writeStringListFirst(labelsList...);
    _out->print(']');
    return *this;
  }

  /// table: column headers.
  PropertyWriter& cols(int columnCount);  // heat: number of columns
  template <typename... TText>
  PropertyWriter& cols(TText... headers) {  // table: column headers
    beginField(F("cols"));
    _out->print('[');
    writeStringListFirst(headers...);
    _out->print(']');
    return *this;
  }

  /// heat: matrix dimensions, color palette, bilinear interpolation.
  PropertyWriter& rows(int rowCount);
  template <typename TText>
  PropertyWriter& palette(TText name) {
    beginField(F("palette"));
    internal::writeEscapedString(*_out, name);
    return *this;
  }
  PropertyWriter& interp(bool interpolate = true);

  /// hist: bin count and sample window.
  PropertyWriter& bins(int binCount);
  PropertyWriter& samples(int n);

  /// polar: radius scale, angular sector, sweep-clear flag.
  PropertyWriter& rmax(double r);
  PropertyWriter& angleRange(double aminDeg, double amaxDeg);
  PropertyWriter& sweep(bool clearOnPass = true);

  /// compass: localized cardinal-point labels, built one at a time.
  template <typename... TText>
  PropertyWriter& ref(TText... points) {
    beginField(F("ref"));
    _out->print('[');
    writeStringListFirst(points...);
    _out->print(']');
    return *this;
  }

  /// button: press-and-hold flag, label, color.
  PropertyWriter& hold(bool holdToActivate = true);
  template <typename TText>
  PropertyWriter& label(TText text) {
    beginField(F("label"));
    internal::writeEscapedString(*_out, text);
    return *this;
  }
  template <typename TText>
  PropertyWriter& color(TText hexColor) {
    beginField(F("color"));
    internal::writeEscapedString(*_out, hexColor);
    return *this;
  }

  /// xy: axis ranges, trail length, point/line mode, axis labels.
  PropertyWriter& xrange(double lo, double hi);
  PropertyWriter& yrange(double lo, double hi);
  PropertyWriter& trail(int points);
  template <typename TText>
  PropertyWriter& mode(TText pointsOrLines) {
    beginField(F("mode"));
    internal::writeEscapedString(*_out, pointsOrLines);
    return *this;
  }
  template <typename TText>
  PropertyWriter& xlabel(TText text) {
    beginField(F("xlabel"));
    internal::writeEscapedString(*_out, text);
    return *this;
  }
  template <typename TText>
  PropertyWriter& ylabel(TText text) {
    beginField(F("ylabel"));
    internal::writeEscapedString(*_out, text);
    return *this;
  }

  /// select: one entry of `opts` — a bare value, or `[value, label]`.
  template <typename TValue>
  PropertyWriter& option(TValue value) {
    beginCollectionEntry(ArrayProp::Option, F("opts"), '[', ']');
    internal::writeEscapedString(*_out, value);
    return *this;
  }
  template <typename TValue, typename TLabel>
  PropertyWriter& option(TValue value, TLabel label) {
    beginCollectionEntry(ArrayProp::Option, F("opts"), '[', ']');
    _out->print('[');
    internal::writeEscapedString(*_out, value);
    _out->print(',');
    internal::writeEscapedString(*_out, label);
    _out->print(']');
    return *this;
  }

  /// color control: quick-pick swatches.
  template <typename... TText>
  PropertyWriter& swatches(TText... hexColors) {
    beginField(F("swatches"));
    _out->print('[');
    writeStringListFirst(hexColors...);
    _out->print(']');
    return *this;
  }

 protected:
  Print* _out;

 private:
  enum class ArrayProp : uint8_t { None, Zone, State, Option };

  ArrayProp _openArray = ArrayProp::None;
  char _openClose = 0;

  void closeOpenArray();
  void beginField(const __FlashStringHelper* key);
  void beginCollectionEntry(ArrayProp which, const __FlashStringHelper* key, char openChar,
                            char closeChar);

  template <typename TKey>
  void beginUserField(TKey key) {
    closeOpenArray();
    _out->print(',');
    internal::writeEscapedString(*_out, key);
    _out->print(':');
  }

  void writeIdListRest() {}
  template <typename TId, typename... TRest>
  void writeIdListRest(TId id, TRest... rest) {
    _out->print(',');
    internal::writeRawId(*_out, id);
    writeIdListRest(rest...);
  }

  void writeStringListFirst() {}
  template <typename TText, typename... TRest>
  void writeStringListFirst(TText first, TRest... rest) {
    internal::writeEscapedString(*_out, first);
    writeStringListRest(rest...);
  }
  void writeStringListRest() {}
  template <typename TText, typename... TRest>
  void writeStringListRest(TText next, TRest... rest) {
    _out->print(',');
    internal::writeEscapedString(*_out, next);
    writeStringListRest(rest...);
  }
};

/// A `w` widget declaration (SPEC.md §3.3 "w"). Returned by
/// `SerialDash::widget()` and by the per-kind factory methods (`line()`,
/// `gauge()`, ...); see `PropertyWriter` for the full set of chainable
/// properties.
class WidgetBuilder : public PropertyWriter {
 public:
  template <typename TId, typename TKind>
  WidgetBuilder(Print& out, TId id, TKind kind) : PropertyWriter(out) {
    _out->print(F("@{\"t\":\"w\",\"id\":"));
    internal::writeRawId(*_out, id);
    _out->print(F(",\"k\":"));
    internal::writeEscapedString(*_out, kind);
  }
};

/// A `u` partial update (SPEC.md §3.3 "u"): merges the given properties into
/// an existing declaration. `id`/`k` cannot be changed, so unlike
/// `WidgetBuilder` there is no `kind` — everything else is the same
/// `PropertyWriter` surface. Returned by `SerialDash::update()`.
class UpdateBuilder : public PropertyWriter {
 public:
  template <typename TId>
  UpdateBuilder(Print& out, TId id) : PropertyWriter(out) {
    _out->print(F("@{\"t\":\"u\",\"id\":"));
    internal::writeRawId(*_out, id);
  }
};

}  // namespace serialdash
