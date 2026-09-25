# Compatibility matrix

## Browsers (APP-GEN-01, APP-GEN-02)

Web Serial is required for real hardware. Supported: **Chrome, Edge, Opera, Brave** (desktop — Windows, macOS, Linux, ChromeOS), last 2 major versions. **Firefox and Safari do not support Web Serial** and are out of scope for v1 (SPEC.md §1.2); on those browsers the app explains why and still offers the simulator and replay, which need no serial access.

## Protocol

| App version     | Protocol version | Library version |
| --------------- | ---------------- | --------------- |
| unreleased (M0) | v1               | unreleased      |

## USB-serial chips with friendly-name recognition (APP-CON-02)

CH340, CP210x, FTDI, native ESP32-S2/S3/C3 USB CDC, Arduino, RP2040 — recognized from USB VID/PID once the connection UI exists (M1).

## Boards tested in library CI (LIB-GEN-03, QA-12)

AVR (Uno, Mega), ESP32 (classic, S2, S3, C3), ESP8266, RP2040 (Earle Philhower and Mbed cores), SAMD. The library targets any core exposing `Stream` (architecture `*`), so this list is what's _verified_, not an exhaustive support boundary.
