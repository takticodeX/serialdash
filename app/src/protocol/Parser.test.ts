import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseLine } from './Parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VECTORS_DIR = path.resolve(__dirname, '../../../protocol/test-vectors');

interface TestVector {
  name: string;
  dir: 'd2a' | 'a2d';
  line: string;
  valid: boolean;
  expect: unknown;
}

function loadVectors(file: string): TestVector[] {
  return readFileSync(path.join(VECTORS_DIR, file), 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => JSON.parse(l) as TestVector);
}

function toSplitLine(line: string): { text: string; raw: Uint8Array; truncated: boolean } {
  return { text: line, raw: new TextEncoder().encode(line), truncated: false };
}

// QA-01: Parser is exercised against every PRO-03 test vector, same fixtures tools/validate-vectors
// checks against the raw schema — this confirms the app's runtime classification (text vs. message
// vs. protocolError) agrees with what the schema says is valid, not just that Ajv itself is wired
// correctly.
describe('PRT-02..06 Parser classification against /protocol/test-vectors', () => {
  for (const file of ['device-to-app.jsonl', 'widgets.jsonl']) {
    describe(file, () => {
      for (const vector of loadVectors(file).filter((v) => v.dir === 'd2a')) {
        it(vector.name, () => {
          const parsed = parseLine(toSplitLine(vector.line));

          if (!vector.line.startsWith('@{')) {
            // PRT-02/03: not a protocol line at all, regardless of the vector's schema verdict.
            expect(parsed.kind).toBe('text');
            return;
          }

          if (vector.valid) {
            expect(parsed.kind).toBe('message');
            if (parsed.kind === 'message') expect(parsed.message).toEqual(vector.expect);
          } else {
            expect(parsed.kind).toBe('protocolError');
          }
        });
      }
    });
  }
});

describe('Parser additional behavior', () => {
  it('carries the truncated flag through from the split line', () => {
    const parsed = parseLine({
      text: 'hello',
      raw: new TextEncoder().encode('hello'),
      truncated: true,
    });
    expect(parsed.truncated).toBe(true);
    expect(parsed.kind).toBe('text');
  });

  it('always keeps the original text, even for a parsed message', () => {
    const line = '@{"t":"pong","r":5}';
    const parsed = parseLine(toSplitLine(line));
    expect(parsed.text).toBe(line);
  });
});
