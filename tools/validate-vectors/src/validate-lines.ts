#!/usr/bin/env tsx
/**
 * QA-11: validates every line a CI step captured from the Arduino library's
 * own native tests (`pio test -e native`, SPEC.md §9.2 QA-10) against the
 * device-to-app JSON Schema — the same schema/Ajv setup `schemas.ts` already
 * uses for the shared protocol test vectors (PRO-01/PRO-03), just pointed at
 * the library's *actual* output instead of the hand-authored fixtures.
 *
 * Usage: tsx src/validate-lines.ts <path-to-captured-lines-file>
 * Each line in that file must be one full protocol line (`@{...}`), one per
 * line, exactly as SerialDash would write it to a real Stream.
 */
import { readFileSync } from 'node:fs';
import { getValidator } from './schemas.js';

const file = process.argv[2];
if (!file) {
  console.error('usage: validate-lines <path-to-captured-lines-file>');
  process.exit(2);
}

const validate = getValidator('d2a');
const lines = readFileSync(file, 'utf8')
  .split('\n')
  .filter((l) => l.length > 0);

let failures = 0;
for (const [i, line] of lines.entries()) {
  if (!line.startsWith('@{')) {
    console.error(`line ${i + 1}: does not start with "@{": ${line}`);
    failures++;
    continue;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(line.slice(1));
  } catch (err) {
    console.error(`line ${i + 1}: invalid JSON: ${(err as Error).message}\n  ${line}`);
    failures++;
    continue;
  }
  if (!validate(parsed)) {
    console.error(`line ${i + 1}: fails device-to-app schema:\n  ${line}`);
    for (const e of validate.errors ?? []) console.error(`    ${e.instancePath} ${e.message}`);
    failures++;
  }
}

console.log(`${lines.length - failures}/${lines.length} lines valid against the schema.`);
if (failures > 0) process.exit(1);
