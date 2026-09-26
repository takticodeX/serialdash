# Memory footprint

::: info
Numbers below are measured in CI by compiling `02_FirstChart` for
`arduino:avr:uno` with and without SerialDash and diffing the sizes
(SPEC.md §9.3, DOC-14). Regenerated on every run — do not edit by hand.
:::

Last measured: 2026-09-26.

|                                                                 |      Flash |       RAM |
| --------------------------------------------------------------- | ---------: | --------: |
| Without SerialDash                                              |     3648 B |     200 B |
| With SerialDash                                                 |     9098 B |     363 B |
| **Overhead (total)**                                            | **5450 B** | **163 B** |
| Receive buffer (`SERIALDASH_RX_BUFFER`, excluded by LIB-GEN-07) |          — |      64 B |
| **RAM overhead beyond the receive buffer**                      |            |  **99 B** |

LIB-GEN-07 budget: overhead must stay within 6144 B (6 KB) of
flash and 150 B of RAM beyond the receive buffer — the buffer
itself is explicitly excluded ("oltre al buffer di ricezione"), so its
64 B (the AVR default) is subtracted from the
measured total above before comparing to the 150 B allowance.

Result: flash ✅ within budget, RAM ✅ within budget.
