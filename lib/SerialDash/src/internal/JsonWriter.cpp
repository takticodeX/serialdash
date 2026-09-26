#include "JsonWriter.h"

#include <math.h>
#include <stdint.h>

namespace serialdash {
namespace internal {

void writeRawId(Print& out, const char* id) {
  out.print('"');
  out.print(id);
  out.print('"');
}

void writeRawId(Print& out, const __FlashStringHelper* id) {
  out.print('"');
  out.print(id);
  out.print('"');
}

namespace {

/// Writes one already-decoded character `c`, escaped per PRT-10, to `out`.
void writeEscapedChar(Print& out, char c) {
  switch (c) {
    case '"':
      out.print(F("\\\""));
      return;
    case '\\':
      out.print(F("\\\\"));
      return;
    case '\n':
      out.print(F("\\n"));
      return;
    case '\r':
      out.print(F("\\r"));
      return;
    case '\t':
      out.print(F("\\t"));
      return;
    default:
      break;
  }
  // Remaining C0 control characters (SPEC.md PRT-10) as \u00XX.
  if (static_cast<uint8_t>(c) < 0x20) {
    out.print(F("\\u00"));
    const uint8_t v = static_cast<uint8_t>(c);
    const char hex[] = "0123456789abcdef";
    out.print(hex[(v >> 4) & 0xF]);
    out.print(hex[v & 0xF]);
    return;
  }
  out.print(c);
}

}  // namespace

void writeEscapedString(Print& out, const char* text) {
  out.print('"');
  if (text != nullptr) {
    for (const char* p = text; *p != '\0'; ++p) {
      writeEscapedChar(out, *p);
    }
  }
  out.print('"');
}

void writeEscapedString(Print& out, const __FlashStringHelper* text) {
  out.print('"');
  if (text != nullptr) {
    PGM_P p = reinterpret_cast<PGM_P>(text);
    char c;
    while ((c = static_cast<char>(pgm_read_byte(p++))) != '\0') {
      writeEscapedChar(out, c);
    }
  }
  out.print('"');
}

void writeInt(Print& out, long value) { out.print(value); }

void writeUInt(Print& out, unsigned long value) { out.print(value); }

void writeBool(Print& out, bool value) { out.print(value ? F("true") : F("false")); }

void writeFloat(Print& out, double value, uint8_t decimals) {
  if (isnan(value) || isinf(value)) {
    out.print(F("null"));
    return;
  }
  if (decimals > 6) decimals = 6;

  bool negative = value < 0;
  if (negative) value = -value;

  unsigned long scale = 1;
  for (uint8_t i = 0; i < decimals; ++i) scale *= 10UL;

  unsigned long scaled = static_cast<unsigned long>(value * static_cast<double>(scale) + 0.5);
  unsigned long intPart = scaled / scale;
  unsigned long fracPart = scaled % scale;

  if (negative && (intPart != 0 || fracPart != 0)) out.print('-');
  out.print(intPart);

  if (decimals > 0 && fracPart != 0) {
    char fracDigits[6];
    for (uint8_t i = decimals; i > 0; --i) {
      fracDigits[i - 1] = static_cast<char>('0' + (fracPart % 10));
      fracPart /= 10;
    }
    uint8_t len = decimals;
    while (len > 0 && fracDigits[len - 1] == '0') --len;
    if (len > 0) {
      out.print('.');
      for (uint8_t i = 0; i < len; ++i) out.print(fracDigits[i]);
    }
  }
}

}  // namespace internal
}  // namespace serialdash
