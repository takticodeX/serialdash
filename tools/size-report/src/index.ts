#!/usr/bin/env tsx
/**
 * SPEC.md §9.3 / DOC-14: compiles `02_FirstChart` for Uno with and without
 * SerialDash, computes the library's flash/RAM overhead, fails the build if
 * it exceeds LIB-GEN-07's budget (<= 6KB flash, <= 150 bytes RAM beyond the
 * receive buffer), and (re)writes docs/library/memory.md with the real
 * numbers — see .github/workflows/ci.yml for how the two `arduino-cli
 * compile --format json` runs that produce this script's input are invoked.
 *
 * Usage: tsx src/index.ts <with-lib.json> <without-lib.json>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');
const MEMORY_MD = path.join(REPO_ROOT, 'docs', 'library', 'memory.md');

// LIB-GEN-07: overhead <= 6KB flash, <= 150 bytes RAM beyond the receive
// buffer. Since M4 (LIB-RX-01), the line buffer really is allocated — as a
// static SERIALDASH_RX_BUFFER-byte member (internal/LineBuffer.h) — so its
// size is subtracted from the measured RAM overhead before comparing to the
// 150 B allowance, matching §6.2's AVR default (this report always measures
// Uno) exactly as SerialDash.h falls back to when the macro isn't overridden.
const FLASH_BUDGET_BYTES = 6 * 1024;
const RAM_BUDGET_BYTES = 150;
const AVR_DEFAULT_RX_BUFFER_BYTES = 64;

interface ArduinoCliCompileOutput {
  builder_result: {
    executable_sections_size: Array<{ name: string; size: number; max_size: number }>;
  };
}

function readSizes(file: string): { flash: number; ram: number } {
  const data = JSON.parse(readFileSync(file, 'utf8')) as ArduinoCliCompileOutput;
  const sections = data.builder_result.executable_sections_size;
  const flash = sections.find((s) => s.name === 'text')?.size ?? 0;
  const ram = sections.find((s) => s.name === 'data')?.size ?? 0;
  return { flash, ram };
}

const [withLibFile, withoutLibFile] = process.argv.slice(2);
if (!withLibFile || !withoutLibFile) {
  console.error('usage: tsx src/index.ts <with-lib.json> <without-lib.json>');
  process.exit(2);
}

const withLib = readSizes(withLibFile);
const withoutLib = readSizes(withoutLibFile);
const flashOverhead = withLib.flash - withoutLib.flash;
const ramOverheadTotal = withLib.ram - withoutLib.ram;
const ramOverheadBeyondRxBuffer = ramOverheadTotal - AVR_DEFAULT_RX_BUFFER_BYTES;

const flashOk = flashOverhead <= FLASH_BUDGET_BYTES;
const ramOk = ramOverheadBeyondRxBuffer <= RAM_BUDGET_BYTES;

const today = new Date().toISOString().slice(0, 10);

const md = `# Memory footprint

::: info
Numbers below are measured in CI by compiling \`02_FirstChart\` for
\`arduino:avr:uno\` with and without SerialDash and diffing the sizes
(SPEC.md §9.3, DOC-14). Regenerated on every run — do not edit by hand.
:::

Last measured: ${today}.

| | Flash | RAM |
| --- | ---: | ---: |
| Without SerialDash | ${withoutLib.flash} B | ${withoutLib.ram} B |
| With SerialDash | ${withLib.flash} B | ${withLib.ram} B |
| **Overhead (total)** | **${flashOverhead} B** | **${ramOverheadTotal} B** |
| Receive buffer (\`SERIALDASH_RX_BUFFER\`, excluded by LIB-GEN-07) | — | ${AVR_DEFAULT_RX_BUFFER_BYTES} B |
| **RAM overhead beyond the receive buffer** | | **${ramOverheadBeyondRxBuffer} B** |

LIB-GEN-07 budget: overhead must stay within ${FLASH_BUDGET_BYTES} B (6 KB) of
flash and ${RAM_BUDGET_BYTES} B of RAM beyond the receive buffer — the buffer
itself is explicitly excluded ("oltre al buffer di ricezione"), so its
${AVR_DEFAULT_RX_BUFFER_BYTES} B (the AVR default) is subtracted from the
measured total above before comparing to the 150 B allowance.

Result: flash ${flashOk ? '✅ within budget' : '❌ OVER BUDGET'}, RAM ${
  ramOk ? '✅ within budget' : '❌ OVER BUDGET'
}.
`;

writeFileSync(MEMORY_MD, md);
console.log(`Wrote ${path.relative(REPO_ROOT, MEMORY_MD)}`);
console.log(`Flash overhead: ${flashOverhead} B (budget ${FLASH_BUDGET_BYTES} B)`);
console.log(
  `RAM overhead:   ${ramOverheadTotal} B total, ${ramOverheadBeyondRxBuffer} B beyond the RX buffer (budget ${RAM_BUDGET_BYTES} B)`,
);

if (!flashOk || !ramOk) {
  console.error('LIB-GEN-07 budget exceeded.');
  process.exit(1);
}
