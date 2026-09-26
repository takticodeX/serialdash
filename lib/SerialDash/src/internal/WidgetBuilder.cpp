#include "WidgetBuilder.h"

namespace serialdash {

PropertyWriter::~PropertyWriter() {
  if (_out == nullptr) return;  // moved-from
  closeOpenArray();
  _out->print(F("}\n"));
}

void PropertyWriter::closeOpenArray() {
  if (_openArray != ArrayProp::None) {
    _out->print(_openClose);
    _openArray = ArrayProp::None;
  }
}

void PropertyWriter::beginField(const __FlashStringHelper* key) {
  closeOpenArray();
  _out->print(F(",\""));
  _out->print(key);
  _out->print(F("\":"));
}

void PropertyWriter::beginCollectionEntry(ArrayProp which, const __FlashStringHelper* key,
                                          char openChar, char closeChar) {
  if (_openArray == which) {
    _out->print(',');
    return;
  }
  beginField(key);
  _out->print(openChar);
  _openArray = which;
  _openClose = closeChar;
}

PropertyWriter& PropertyWriter::order(long ord) {
  beginField(F("ord"));
  internal::writeInt(*_out, ord);
  return *this;
}

PropertyWriter& PropertyWriter::size(uint8_t widthCells, uint8_t heightCells) {
  beginField(F("size"));
  _out->print('[');
  _out->print(widthCells);
  _out->print(',');
  _out->print(heightCells);
  _out->print(']');
  return *this;
}

PropertyWriter& PropertyWriter::decimals(uint8_t n) {
  beginField(F("dec"));
  _out->print(n);
  return *this;
}

PropertyWriter& PropertyWriter::stale(double seconds) {
  beginField(F("stale"));
  internal::writeFloat(*_out, seconds, SERIALDASH_FLOAT_DECIMALS);
  return *this;
}

PropertyWriter& PropertyWriter::range(double lo, double hi) {
  beginField(F("min"));
  internal::writeFloat(*_out, lo, SERIALDASH_FLOAT_DECIMALS);
  beginField(F("max"));
  internal::writeFloat(*_out, hi, SERIALDASH_FLOAT_DECIMALS);
  return *this;
}

PropertyWriter& PropertyWriter::disabled() {
  beginField(F("dis"));
  internal::writeBool(*_out, true);
  return *this;
}

PropertyWriter& PropertyWriter::value(int v) { return value(static_cast<long>(v)); }

PropertyWriter& PropertyWriter::value(long v) {
  beginField(F("val"));
  internal::writeInt(*_out, v);
  return *this;
}

PropertyWriter& PropertyWriter::value(unsigned int v) {
  return value(static_cast<unsigned long>(v));
}

PropertyWriter& PropertyWriter::value(unsigned long v) {
  beginField(F("val"));
  internal::writeUInt(*_out, v);
  return *this;
}

PropertyWriter& PropertyWriter::value(double v, uint8_t decimalPlaces) {
  beginField(F("val"));
  internal::writeFloat(*_out, v, decimalPlaces);
  return *this;
}

PropertyWriter& PropertyWriter::value(bool v) {
  beginField(F("val"));
  internal::writeBool(*_out, v);
  return *this;
}

PropertyWriter& PropertyWriter::window(double seconds) {
  beginField(F("win"));
  internal::writeFloat(*_out, seconds, SERIALDASH_FLOAT_DECIMALS);
  return *this;
}

PropertyWriter& PropertyWriter::step(bool stepped) {
  beginField(F("step"));
  internal::writeBool(*_out, stepped);
  return *this;
}

PropertyWriter& PropertyWriter::fill(bool filled) {
  beginField(F("fill"));
  internal::writeBool(*_out, filled);
  return *this;
}

PropertyWriter& PropertyWriter::stepSize(double s) {
  beginField(F("step"));
  internal::writeFloat(*_out, s, SERIALDASH_FLOAT_DECIMALS);
  return *this;
}

PropertyWriter& PropertyWriter::trend(bool show) {
  beginField(F("trend"));
  internal::writeBool(*_out, show);
  return *this;
}

PropertyWriter& PropertyWriter::minmax(bool show) {
  beginField(F("minmax"));
  internal::writeBool(*_out, show);
  return *this;
}

PropertyWriter& PropertyWriter::warn(double lo, double hi) {
  beginField(F("warn"));
  _out->print('[');
  internal::writeFloat(*_out, lo, SERIALDASH_FLOAT_DECIMALS);
  _out->print(',');
  internal::writeFloat(*_out, hi, SERIALDASH_FLOAT_DECIMALS);
  _out->print(']');
  return *this;
}

PropertyWriter& PropertyWriter::alarm(double lo, double hi) {
  beginField(F("alarm"));
  _out->print('[');
  internal::writeFloat(*_out, lo, SERIALDASH_FLOAT_DECIMALS);
  _out->print(',');
  internal::writeFloat(*_out, hi, SERIALDASH_FLOAT_DECIMALS);
  _out->print(']');
  return *this;
}

PropertyWriter& PropertyWriter::vert(bool vertical) {
  beginField(F("vert"));
  internal::writeBool(*_out, vertical);
  return *this;
}

PropertyWriter& PropertyWriter::limit(long n) {
  beginField(F("max"));
  internal::writeInt(*_out, n);
  return *this;
}

PropertyWriter& PropertyWriter::donut(bool show) {
  beginField(F("donut"));
  internal::writeBool(*_out, show);
  return *this;
}

PropertyWriter& PropertyWriter::pct(bool show) {
  beginField(F("pct"));
  internal::writeBool(*_out, show);
  return *this;
}

PropertyWriter& PropertyWriter::horiz(bool horizontal) {
  beginField(F("horiz"));
  internal::writeBool(*_out, horizontal);
  return *this;
}

PropertyWriter& PropertyWriter::cols(int columnCount) {
  beginField(F("cols"));
  _out->print(columnCount);
  return *this;
}

PropertyWriter& PropertyWriter::rows(int rowCount) {
  beginField(F("rows"));
  _out->print(rowCount);
  return *this;
}

PropertyWriter& PropertyWriter::interp(bool interpolate) {
  beginField(F("interp"));
  internal::writeBool(*_out, interpolate);
  return *this;
}

PropertyWriter& PropertyWriter::bins(int binCount) {
  beginField(F("bins"));
  _out->print(binCount);
  return *this;
}

PropertyWriter& PropertyWriter::samples(int n) {
  beginField(F("n"));
  _out->print(n);
  return *this;
}

PropertyWriter& PropertyWriter::rmax(double r) {
  beginField(F("rmax"));
  internal::writeFloat(*_out, r, SERIALDASH_FLOAT_DECIMALS);
  return *this;
}

PropertyWriter& PropertyWriter::angleRange(double aminDeg, double amaxDeg) {
  beginField(F("amin"));
  internal::writeFloat(*_out, aminDeg, SERIALDASH_FLOAT_DECIMALS);
  beginField(F("amax"));
  internal::writeFloat(*_out, amaxDeg, SERIALDASH_FLOAT_DECIMALS);
  return *this;
}

PropertyWriter& PropertyWriter::sweep(bool clearOnPass) {
  beginField(F("sweep"));
  internal::writeBool(*_out, clearOnPass);
  return *this;
}

PropertyWriter& PropertyWriter::hold(bool holdToActivate) {
  beginField(F("hold"));
  internal::writeBool(*_out, holdToActivate);
  return *this;
}

PropertyWriter& PropertyWriter::xrange(double lo, double hi) {
  beginField(F("xmin"));
  internal::writeFloat(*_out, lo, SERIALDASH_FLOAT_DECIMALS);
  beginField(F("xmax"));
  internal::writeFloat(*_out, hi, SERIALDASH_FLOAT_DECIMALS);
  return *this;
}

PropertyWriter& PropertyWriter::yrange(double lo, double hi) {
  beginField(F("ymin"));
  internal::writeFloat(*_out, lo, SERIALDASH_FLOAT_DECIMALS);
  beginField(F("ymax"));
  internal::writeFloat(*_out, hi, SERIALDASH_FLOAT_DECIMALS);
  return *this;
}

PropertyWriter& PropertyWriter::trail(int points) {
  beginField(F("trail"));
  _out->print(points);
  return *this;
}

}  // namespace serialdash
