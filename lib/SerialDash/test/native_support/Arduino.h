#pragma once

// Minimal host-only stand-in for the Arduino core, used ONLY by the
// `native` PlatformIO test environment (`pio test -e native`, SPEC.md §9.2
// QA-10) so SerialDash's own source can be compiled and exercised as plain
// C++ on the CI/dev machine, without needing an AVR/Xtensa toolchain for
// every test run. Never shipped as part of the library (see library.json's
// "export.include", which does not mention `test/`) and never used by real
// sketches, which get the real Arduino core from their board's platform
// instead.
//
// Deliberately reimplements a handful of Arduino conventions rather than
// pulling in a third-party mock (e.g. ArduinoFake) as a test-only
// dependency, keeping the whole native test environment dependency-free and
// its behavior fully visible in one place.

#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include <string>

// Real Arduino.h; used by SerialDash's RX path (§6.3) for handshake/ping timing. The native
// tests that need `millis()` to actually advance drive it themselves via advanceMillis() below —
// there's no wall clock to read on the host that would mean anything.
//
// A function-local static (not a namespace-scope `inline` variable — that needs C++17, and this
// header is included from multiple translation units under this project's C++11 target) so every
// TU's copy of these inline functions shares the exact same counter, per the standard's
// single-instance guarantee for statics in inline functions since C++98.
inline unsigned long& fakeMillisRef() {
  static unsigned long value = 0;
  return value;
}
inline unsigned long millis() { return fakeMillisRef(); }
inline void advanceMillis(unsigned long ms) { fakeMillisRef() += ms; }

// On real cores, F("...") wraps a string literal so it is stored in flash
// (PROGMEM) instead of RAM (LIB-GEN-09). On this host build there is no
// separate flash address space, so __FlashStringHelper is just a distinct
// *type* tag over an ordinary C string — pgm_read_byte below reads it with a
// plain dereference, exactly like real non-AVR Arduino cores (ESP32, SAMD,
// RP2040) already do.
struct __FlashStringHelper;
#define F(stringLiteral) (reinterpret_cast<const __FlashStringHelper*>(stringLiteral))
#define PROGMEM
typedef const char* PGM_P;
inline uint8_t pgm_read_byte(PGM_P p) { return static_cast<uint8_t>(*p); }

class Print {
 public:
  virtual ~Print() = default;
  virtual size_t write(uint8_t c) = 0;
  virtual size_t write(const uint8_t* buffer, size_t size) {
    size_t n = 0;
    for (size_t i = 0; i < size; ++i) n += write(buffer[i]);
    return n;
  }

  size_t print(char c) { return write(static_cast<uint8_t>(c)); }
  size_t print(const char* s) { return write(reinterpret_cast<const uint8_t*>(s), strlen(s)); }
  size_t print(const __FlashStringHelper* s) { return print(reinterpret_cast<const char*>(s)); }
  size_t print(long v) {
    char buf[24];
    snprintf(buf, sizeof(buf), "%ld", v);
    return print(static_cast<const char*>(buf));
  }
  size_t print(int v) { return print(static_cast<long>(v)); }
  size_t print(unsigned long v) {
    char buf[24];
    snprintf(buf, sizeof(buf), "%lu", v);
    return print(static_cast<const char*>(buf));
  }
  size_t print(unsigned int v) { return print(static_cast<unsigned long>(v)); }
  size_t print(uint8_t v) { return print(static_cast<unsigned long>(v)); }
};

class Stream : public Print {
 public:
  virtual int available() { return 0; }
  virtual int read() { return -1; }
  virtual int peek() { return -1; }
};

// Captures everything written to it in a std::string, so native tests can make assertions on the
// exact bytes SerialDash produced. Also holds an input queue (`feedInput`) so RX-path tests
// (§6.3) can simulate the app sending bytes, consumed via the usual available()/read().
class FakeStream : public Stream {
 public:
  size_t write(uint8_t c) override {
    captured.push_back(static_cast<char>(c));
    return 1;
  }

  int available() override { return static_cast<int>(toRead.size() - readPos); }

  int read() override {
    if (readPos >= toRead.size()) return -1;
    return static_cast<uint8_t>(toRead[readPos++]);
  }

  void feedInput(const char* s) { toRead += s; }

  std::string captured;

 private:
  std::string toRead;
  size_t readPos = 0;
};
