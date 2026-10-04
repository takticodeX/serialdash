# Compatibility matrix

## Browsers

Real hardware requires Web Serial. Supported: **Chrome, Edge, Opera, Brave** (desktop — Windows, macOS, Linux, ChromeOS), last 2 major versions. **Firefox and Safari don't support Web Serial** and can't connect to real boards; on those browsers the app explains why and still offers the built-in simulator, which needs no serial access at all.

## Protocol

| App version | Protocol version | Library version |
| ----------- | ---------------- | --------------- |
| 0.0.0       | v1               | 0.1.0           |

## USB-serial chips with friendly-name recognition

CH340, CH9102, CP210x, FTDI (FT232/FT230X), native ESP32 USB, Arduino, RP2040 — recognized from the USB vendor/product id and shown by name in the port picker instead of a generic "USB serial device" label. Any other Web Serial–compatible chip still works for connecting — this list only affects how its name is displayed.

## Boards tested in library CI

AVR (Uno, Mega), ESP32 (classic, S2, S3, C3), ESP8266, RP2040 (Earle Philhower and Mbed cores), SAMD. The library targets any core exposing `Stream`, so this list is what's _verified_ in continuous integration, not an exhaustive support boundary — other Arduino-compatible cores are likely to work too.
