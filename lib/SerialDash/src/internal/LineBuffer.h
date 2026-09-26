#pragma once

#include <Arduino.h>
#include <stdint.h>

#ifndef SERIALDASH_RX_BUFFER
#ifdef __AVR__
#define SERIALDASH_RX_BUFFER 64
#else
#define SERIALDASH_RX_BUFFER 256
#endif
#endif

namespace serialdash {
namespace internal {

/// Accumulates bytes into a fixed `SERIALDASH_RX_BUFFER`-sized line (LIB-RX-01), one static
/// buffer, no allocation. `\r\n` and bare `\n` both terminate a line (PRT-01); a line longer than
/// the buffer overflows (LIB-RX-04): remaining bytes up to the next `\n` are discarded instead of
/// silently wrapping or truncating mid-line.
class LineBuffer {
 public:
  /// Feeds one byte. Returns true once a full line is ready — call `line()` (or check
  /// `overflowed()` first) and then `reset()` before feeding more bytes.
  bool feed(char c) {
    if (c == '\n') {
      if (!_overflow && _len > 0 && _buf[_len - 1] == '\r') --_len;
      _buf[_len] = '\0';
      return true;
    }
    if (_overflow) return false;
    if (_len + 1 >= SERIALDASH_RX_BUFFER) {
      _overflow = true;
      return false;
    }
    _buf[_len++] = c;
    return false;
  }

  bool overflowed() const { return _overflow; }

  /// NUL-terminated line content. Only meaningful when `feed()` just returned true and
  /// `overflowed()` is false.
  char* line() { return _buf; }

  void reset() {
    _len = 0;
    _overflow = false;
  }

 private:
  char _buf[SERIALDASH_RX_BUFFER];
  uint16_t _len = 0;
  bool _overflow = false;
};

}  // namespace internal
}  // namespace serialdash
