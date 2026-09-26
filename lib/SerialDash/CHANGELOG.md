# Library changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioned independently from the protocol and the app (DOC-42).

## [Unreleased]

### Added

- Library scaffolding: Arduino Library Manager + PlatformIO layout (`library.properties`,
  `library.json`, `keywords.txt`), works on any core exposing `Stream` (LIB-GEN-01..04).
- Compile-time options: `SERIALDASH_RX_BUFFER`, `SERIALDASH_MAX_CONTROLS`,
  `SERIALDASH_MAX_CHANNELS_ARG`, `SERIALDASH_THREAD_SAFE`, `SERIALDASH_FLOAT_DECIMALS` (§6.2).
- Transmit API (§6.4): `begin()`/`loop()`/`onDeclare()`/`appConnected()`; a streaming,
  allocation-free builder for every widget kind in SPEC.md §4 (`line`, `value`, `gauge`, `led`,
  `log`, `xy`, `bar`, `pie`, `level`, `table`, `heat`, `hist`, `polar`, `compass`, `attitude`,
  `button`, `toggle`, `slider`, `number`, `select`, `text`, `color`, plus the generic `widget()`
  escape hatch); `update()`/`remove()`/`removeAll()`; `data()`/`send()`/`sendXY()`/`sendArray()`
  for channel data (LIB-TX-01..12); `debug()`/`info()`/`warn()`/`error()` events, plus printf
  variants on non-AVR platforms.
- Examples: `01_TextOnly`, `02_FirstChart`, `03_WeatherStation`, `07_TextCommands`.
- Native unit tests (`pio test -e native`) reconstructing the shared `/protocol/test-vectors`
  fixtures through the builder API, plus schema validation of every line the tests produce
  (QA-10, QA-11, PRO-04).
- CI: `arduino-lint` (Library Manager mode), `clang-format`, and an 8-board compile matrix
  (Uno, Mega, ESP32, ESP32-S3, ESP32-C3, ESP8266, RP2040, SAMD — LIB-GEN-03/QA-12), plus a size
  report comparing `02_FirstChart` with and without the library against the LIB-GEN-07 budget
  (§9.3, DOC-14): current overhead is ~1.4 KB flash / ~12 B RAM on Uno, well within the 6 KB /
  150 B allowance.

### Known limitations (tracked for later milestones)

- `appConnected()` always returns `false`: a truthful answer needs the app's `hi`/`ping` to be
  received, which needs the RX parser landing in M4.
- Controls (`onControl`, `onAnyControl`, `onText`, ack/echo) are not implemented yet — declaring
  control widgets works, but nothing dispatches incoming commands until M4 (§6.3, §6.5).
- The float formatter targets realistic sensor-reading magnitudes (fixed-point, up to 6 decimal
  places); values near the extremes of the `double` range are out of scope.
