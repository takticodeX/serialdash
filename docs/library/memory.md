# Memory footprint

::: info
Numbers below are measured in CI by compiling `02_FirstChart` for
`arduino:avr:uno` with and without SerialDash and diffing the sizes
(SPEC.md §9.3, DOC-14). Regenerated on every run — do not edit by hand.
:::

Last measured: 2026-09-26.

|                    |      Flash |      RAM |
| ------------------ | ---------: | -------: |
| Without SerialDash |     3648 B |    200 B |
| With SerialDash    |     5002 B |    212 B |
| **Overhead**       | **1354 B** | **12 B** |

LIB-GEN-07 budget: overhead must stay within 6144 B (6 KB) of
flash and 150 B of RAM beyond the receive buffer. As of M3
(SPEC.md §11), the receive buffer itself isn't allocated yet — that lands in
M4 alongside the rest of §6.3 — so today's RAM overhead is compared directly
against the 150 B allowance with no buffer size to subtract yet.

Result: flash ✅ within budget, RAM ✅ within budget.
