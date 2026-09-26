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
// buffer. M3 doesn't allocate a receive buffer yet (LIB-RX-01 lands in M4),
// so today's whole RAM overhead is compared directly against the 150-byte
// allowance with no buffer to subtract.
const FLASH_BUDGET_BYTES = 6 * 1024;
const RAM_BUDGET_BYTES = 150;

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
const ramOverhead = withLib.ram - withoutLib.ram;

const flashOk = flashOverhead <= FLASH_BUDGET_BYTES;
const ramOk = ramOverhead <= RAM_BUDGET_BYTES;

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
| **Overhead** | **${flashOverhead} B** | **${ramOverhead} B** |

LIB-GEN-07 budget: overhead must stay within ${FLASH_BUDGET_BYTES} B (6 KB) of
flash and ${RAM_BUDGET_BYTES} B of RAM beyond the receive buffer. As of M3
(SPEC.md §11), the receive buffer itself isn't allocated yet — that lands in
M4 alongside the rest of §6.3 — so today's RAM overhead is compared directly
against the 150 B allowance with no buffer size to subtract yet.

Result: flash ${flashOk ? '✅ within budget' : '❌ OVER BUDGET'}, RAM ${
  ramOk ? '✅ within budget' : '❌ OVER BUDGET'
}.
`;

writeFileSync(MEMORY_MD, md);
console.log(`Wrote ${path.relative(REPO_ROOT, MEMORY_MD)}`);
console.log(`Flash overhead: ${flashOverhead} B (budget ${FLASH_BUDGET_BYTES} B)`);
console.log(`RAM overhead:   ${ramOverhead} B (budget ${RAM_BUDGET_BYTES} B)`);

if (!flashOk || !ramOk) {
  console.error('LIB-GEN-07 budget exceeded.');
  process.exit(1);
}
