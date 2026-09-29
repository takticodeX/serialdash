# Compile-time options

`#define` any of these **before** `#include <SerialDash.h>` to override the default for your board:

```cpp
#define SERIALDASH_RX_BUFFER 128
#include <SerialDash.h>
```

| Macro                         | Default (AVR) | Default (other cores) | Meaning                                                                                                                                                                     |
| ----------------------------- | ------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SERIALDASH_RX_BUFFER`        | 64            | 256                   | Bytes for the incoming-line buffer. Announced to the app in `hi`'s `rx` field — a control whose value would overflow this fails to parse rather than corrupting the buffer. |
| `SERIALDASH_MAX_CONTROLS`     | 6             | 32                    | Max number of `onControl` callbacks you can register with `dash.onControl(...)`.                                                                                            |
| `SERIALDASH_MAX_CHANNELS_ARG` | 8             | 8                     | Max channels passable to a single `ch(...)`/`labels(...)` call (multi-channel widgets).                                                                                     |
| `SERIALDASH_THREAD_SAFE`      | 0             | 1 on ESP32            | Serializes writes with a FreeRTOS mutex — needed if more than one task calls `dash.send()`/`dash.data()` etc.                                                               |
| `SERIALDASH_FLOAT_DECIMALS`   | 3             | 3                     | Default decimal places for float/double values, when a call doesn't specify its own.                                                                                        |

## Why these and not something else

The library allocates nothing at runtime (`malloc`/`new`/`String` are never used) — every buffer these macros size is a fixed static array, decided at compile time. That's what keeps it running on an Uno's 2 KB of RAM at all; there's no way to raise a limit "at runtime" the way you might with a heap-backed library. If you hit one of these limits (a truncated line, a `dash.onControl()` call silently ignored past the max), raising the relevant macro is the fix — check your board's flash/RAM budget first if it's already tight (see [memory](./memory)).

## AVR vs. everything else

The lower AVR defaults specifically target the Arduino Uno/Nano/Mega's limited RAM (LIB-GEN-07's budget is measured against an Uno). Boards with more RAM (ESP32, ESP8266, RP2040, SAMD) get roomier defaults automatically — no need to raise them yourself unless you're doing something unusual (many channels, many controls, or long control values).
