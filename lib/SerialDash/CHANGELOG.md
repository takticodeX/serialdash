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
- Examples: `01_TextOnly`, `02_FirstChart`, `03_WeatherStation`, `04_Controls`, `07_TextCommands`
  (the last two grew real `onText`/`onControl` handlers once the receive path existed).
- Receive path (§6.3): `loop()` reads the Stream, accumulates a line (`SERIALDASH_RX_BUFFER`,
  LIB-RX-01), and dispatches it — a minimal in-place JSON parser for flat a2d objects (LIB-RX-02
  /03, nested values skipped per spec rather than erroring), overflow reported as an `rx overflow`
  event (LIB-RX-04), free text routed to `onText` (LIB-RX-05), `hi`/`ping`/`c` handled
  automatically (LIB-RX-06), unknown control ids acked `ok:false` (LIB-RX-07).
- Controls API (§6.5): `DashValue` (type queries, tolerant `toInt()`/`toBool()`/... conversions,
  `set()` to change the echoed value, `reject()` to refuse with a reason); `onControl()` (both
  `const char*` and `F()` ids) and `onAnyControl()` fallback; automatic `ack` + echo `d` after a
  successful control (LIB-CTL-04), `setAutoEcho(false)` to opt out of just the echo.
- `appConnected()` is now real: true once the app's `hi` has been seen and a `ping` arrived within
  the last 5s (SPEC.md §3.5 rule 5).
- Native unit tests (`pio test -e native`) reconstructing the shared `/protocol/test-vectors`
  fixtures through the builder API and, since M4, through the real receive path (every a2d vector,
  fed byte-by-byte and dispatched via `loop()`) — plus schema validation of every line the tests
  produce (QA-10, QA-11, PRO-04, now covering both directions).
- CI: `arduino-lint` (Library Manager mode), `clang-format`, and an 8-board compile matrix
  (Uno, Mega, ESP32, ESP32-S3, ESP32-C3, ESP8266, RP2040, SAMD — LIB-GEN-03/QA-12), plus a size
  report comparing `02_FirstChart` with and without the library against the LIB-GEN-07 budget
  (§9.3, DOC-14, RX buffer correctly excluded from the RAM figure per that requirement's own
  wording): current overhead is ~5.4 KB flash / ~99 B RAM beyond the receive buffer on Uno, within
  the 6 KB / 150 B allowance but markedly closer to the flash ceiling now that the RX parser is
  always linked in — worth watching in future milestones.

### Known limitations (tracked for later milestones)

- The float formatter (both directions) targets realistic sensor-reading magnitudes (fixed-point,
  up to 6 decimal places); values near the extremes of the `double` range are out of scope.
- `\uXXXX` escapes in incoming strings decode BMP code points only — surrogate pairs (astral-plane
  characters) aren't combined. Control ids/values are short by construction (PRT-11), so this is
  unlikely to matter in practice.
