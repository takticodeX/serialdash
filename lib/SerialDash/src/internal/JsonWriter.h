#pragma once

#include <Arduino.h>

/// Low-level, allocation-free JSON writing primitives shared by WidgetBuilder,
/// DataBuilder and the event/text output paths (SPEC.md §6.1 LIB-GEN-05: no
/// malloc/new/String anywhere in the library).
///
/// Every helper writes directly to a `Print&` (usually the user's `Stream&`).
/// Multi-character literals used internally (JSON punctuation words, escape
/// sequences) are always emitted via `F()` so they live in flash, not RAM, on
/// AVR (LIB-GEN-09) — this matters because otherwise every widget property
/// name written by this library would permanently occupy Uno's 2KB of RAM.
namespace serialdash {
namespace internal {

/// Writes a widget/channel id (PRT-11: `^[A-Za-z_][A-Za-z0-9_.-]{0,15}$`) as a
/// bare JSON string. Ids never need escaping since the charset is already
/// JSON-safe — callers must not pass user-controlled text here.
void writeRawId(Print& out, const char* id);
void writeRawId(Print& out, const __FlashStringHelper* id);

/// Writes `text` as a JSON string literal (with the surrounding quotes),
/// escaping `"`, `\` and control characters per PRT-10. Reads flash-resident
/// strings one byte at a time via `pgm_read_byte` so the whole string never
/// needs to be copied into RAM first.
void writeEscapedString(Print& out, const char* text);
void writeEscapedString(Print& out, const __FlashStringHelper* text);

/// Writes a bare (unquoted) JSON integer.
void writeInt(Print& out, long value);
void writeUInt(Print& out, unsigned long value);

/// Writes a bare JSON number formatted to `decimals` places with trailing
/// zeros stripped (LIB-TX-11), or the literal `null` for NaN/Infinity
/// (PRT-09, since JSON has no representation for either). `decimals` is
/// clamped to [0,6] — sufficient for any sensor reading this library is
/// meant to carry, and it keeps the fixed-point math below in range on a
/// 16-bit `int`/32-bit `long` AVR target.
void writeFloat(Print& out, double value, uint8_t decimals);

/// Writes the bare JSON literal `true`/`false`.
void writeBool(Print& out, bool value);

}  // namespace internal
}  // namespace serialdash
