#pragma once

#include <Arduino.h>
#include <stdint.h>

/// Minimal, allocation-free JSON parser for the flat objects app→device messages are required to
/// be (PRT-40, LIB-RX-02/03): reads a `{...}` object in place, mutating the caller's buffer to
/// unescape string values so each parsed field's text is a plain pointer *into that same
/// buffer* — never a copy (LIB-GEN-05: no malloc/new/String anywhere in this library).
namespace serialdash {
namespace internal {

enum class FieldType : uint8_t { None, Number, Bool, String, Null };

struct Field {
  const char* key = nullptr;
  FieldType type = FieldType::None;
  double number = 0;
  bool boolean = false;
  /// Valid only when `type == String`. Points into the buffer `parseFlatObject` was given —
  /// valid exactly as long as that buffer is (i.e. until the next line is read).
  const char* text = nullptr;
};

/// Parses the flat JSON object in `buf` (which must start with `{` and be NUL-terminated),
/// filling in up to `maxFields` entries of `fields`. Returns the number of fields captured.
///
/// Nested objects/arrays are recognized and skipped without error (LIB-RX-02, "compatibilità
/// futura") rather than populating a field for them. Malformed input simply stops parsing and
/// returns whatever was captured so far — there is no separate error signal, matching PRT-06/
/// PRT-04's principle that this is the *device's* parser: showing the user a protocol error is
/// the app's job, not the firmware's.
uint8_t parseFlatObject(char* buf, Field* fields, uint8_t maxFields);

/// Finds a field by key in an array already filled in by `parseFlatObject`, or nullptr.
const Field* findField(const Field* fields, uint8_t count, const char* key);

}  // namespace internal
}  // namespace serialdash
