#include "SerialDash.h"

#ifndef __AVR__
#include <stdarg.h>
#include <stdio.h>

void SerialDash::eventf(const char* lvl, const char* fmt, va_list args) {
  char buf[128];
  vsnprintf(buf, sizeof(buf), fmt, args);
  _stream.print(F("@{\"t\":\"e\",\"lvl\":\""));
  _stream.print(lvl);
  _stream.print(F("\",\"msg\":"));
  serialdash::internal::writeEscapedString(_stream, static_cast<const char*>(buf));
  _stream.print(F("}\n"));
}

void SerialDash::debugf(const char* fmt, ...) {
  va_list args;
  va_start(args, fmt);
  eventf("debug", fmt, args);
  va_end(args);
}

void SerialDash::infof(const char* fmt, ...) {
  va_list args;
  va_start(args, fmt);
  eventf("info", fmt, args);
  va_end(args);
}

void SerialDash::warnf(const char* fmt, ...) {
  va_list args;
  va_start(args, fmt);
  eventf("warn", fmt, args);
  va_end(args);
}

void SerialDash::errorf(const char* fmt, ...) {
  va_list args;
  va_start(args, fmt);
  eventf("err", fmt, args);
  va_end(args);
}

#endif  // __AVR__
