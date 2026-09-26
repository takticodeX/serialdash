#include "JsonParser.h"

#include <stdlib.h>
#include <string.h>

namespace serialdash {
namespace internal {

namespace {

void skipWhitespace(const char*& p) {
  while (*p == ' ' || *p == '\t' || *p == '\n' || *p == '\r') ++p;
}

/// Encodes one Unicode code point (BMP only — `\uXXXX` escapes never combine surrogate pairs
/// here, since PRT-11-sized ids/values realistically never need astral-plane characters, and a2d
/// payloads are short by construction) as UTF-8 into `out`. Returns the byte count written.
size_t utf8Encode(unsigned int codepoint, char* out) {
  if (codepoint < 0x80) {
    out[0] = static_cast<char>(codepoint);
    return 1;
  }
  if (codepoint < 0x800) {
    out[0] = static_cast<char>(0xC0 | (codepoint >> 6));
    out[1] = static_cast<char>(0x80 | (codepoint & 0x3F));
    return 2;
  }
  out[0] = static_cast<char>(0xE0 | (codepoint >> 12));
  out[1] = static_cast<char>(0x80 | ((codepoint >> 6) & 0x3F));
  out[2] = static_cast<char>(0x80 | (codepoint & 0x3F));
  return 3;
}

unsigned int hex4(const char* p) {
  unsigned int v = 0;
  for (uint8_t i = 0; i < 4; ++i) {
    char c = p[i];
    v <<= 4;
    if (c >= '0' && c <= '9')
      v |= static_cast<unsigned int>(c - '0');
    else if (c >= 'a' && c <= 'f')
      v |= static_cast<unsigned int>(c - 'a' + 10);
    else if (c >= 'A' && c <= 'F')
      v |= static_cast<unsigned int>(c - 'A' + 10);
  }
  return v;
}

/// Parses the JSON string starting at `p` (which must point at the opening `"`), unescaping it
/// in place: the write cursor never runs ahead of the read cursor (every escape sequence decodes
/// to no more bytes than it read), so this never overwrites not-yet-read input. Advances `p`
/// past the closing quote and returns a pointer to the NUL-terminated unescaped text.
char* parseStringInPlace(const char*& p) {
  ++p;  // opening quote
  char* start = const_cast<char*>(p);
  char* w = start;
  while (*p != '\0' && *p != '"') {
    if (*p == '\\') {
      ++p;
      switch (*p) {
        case '"':
          *w++ = '"';
          ++p;
          break;
        case '\\':
          *w++ = '\\';
          ++p;
          break;
        case '/':
          *w++ = '/';
          ++p;
          break;
        case 'b':
          *w++ = '\b';
          ++p;
          break;
        case 'f':
          *w++ = '\f';
          ++p;
          break;
        case 'n':
          *w++ = '\n';
          ++p;
          break;
        case 'r':
          *w++ = '\r';
          ++p;
          break;
        case 't':
          *w++ = '\t';
          ++p;
          break;
        case 'u':
          ++p;
          w += utf8Encode(hex4(p), w);
          p += 4;
          break;
        default:
          if (*p == '\0') break;
          ++p;  // unrecognized escape — drop it defensively rather than fail the whole line
          break;
      }
    } else {
      *w++ = *p++;
    }
  }
  if (*p == '"') ++p;  // closing quote
  *w = '\0';
  return start;
}

/// Skips a nested `{...}` or `[...]` value (LIB-RX-02), respecting strings (so a `}`/`]`
/// character inside a string doesn't end the skip early).
void skipNested(const char*& p) {
  char open = *p;
  char close = (open == '{') ? '}' : ']';
  int depth = 0;
  while (*p != '\0') {
    if (*p == '"') {
      ++p;
      while (*p != '\0' && *p != '"') {
        if (*p == '\\' && p[1] != '\0')
          p += 2;
        else
          ++p;
      }
      if (*p == '"') ++p;
      continue;
    }
    if (*p == open) {
      ++depth;
      ++p;
    } else if (*p == close) {
      --depth;
      ++p;
      if (depth == 0) return;
    } else {
      ++p;
    }
  }
}

bool parseValue(const char*& p, Field& field) {
  skipWhitespace(p);
  if (*p == '"') {
    field.type = FieldType::String;
    field.text = parseStringInPlace(p);
    return true;
  }
  if (strncmp(p, "true", 4) == 0) {
    field.type = FieldType::Bool;
    field.boolean = true;
    p += 4;
    return true;
  }
  if (strncmp(p, "false", 5) == 0) {
    field.type = FieldType::Bool;
    field.boolean = false;
    p += 5;
    return true;
  }
  if (strncmp(p, "null", 4) == 0) {
    field.type = FieldType::Null;
    p += 4;
    return true;
  }
  if (*p == '{' || *p == '[') {
    skipNested(p);
    field.type = FieldType::None;  // present on the wire, but not a value we keep (LIB-RX-02)
    return true;
  }
  if (*p == '-' || (*p >= '0' && *p <= '9')) {
    char* end = nullptr;
    double v = strtod(p, &end);
    if (end == p) return false;
    field.type = FieldType::Number;
    field.number = v;
    p = end;
    return true;
  }
  return false;
}

}  // namespace

uint8_t parseFlatObject(char* buf, Field* fields, uint8_t maxFields) {
  const char* p = buf;
  skipWhitespace(p);
  if (*p != '{') return 0;
  ++p;
  uint8_t count = 0;
  skipWhitespace(p);
  if (*p == '}') return 0;

  for (;;) {
    skipWhitespace(p);
    if (*p != '"') return count;
    const char* key = parseStringInPlace(p);
    skipWhitespace(p);
    if (*p != ':') return count;
    ++p;

    Field parsed;
    parsed.key = key;
    if (!parseValue(p, parsed)) return count;
    if (count < maxFields && parsed.type != FieldType::None) fields[count++] = parsed;

    skipWhitespace(p);
    if (*p == ',') {
      ++p;
      continue;
    }
    if (*p == '}') return count;
    return count;  // malformed (missing , or }) — stop, keep whatever was parsed
  }
}

const Field* findField(const Field* fields, uint8_t count, const char* key) {
  for (uint8_t i = 0; i < count; ++i) {
    if (strcmp(fields[i].key, key) == 0) return &fields[i];
  }
  return nullptr;
}

}  // namespace internal
}  // namespace serialdash
