import { describe, expect, it } from 'vitest';
import { LineSplitter } from './LineSplitter';

function bytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

describe('PRT-01 line framing via LineSplitter', () => {
  it('splits a single chunk with multiple LF-terminated lines', () => {
    const splitter = new LineSplitter();
    const lines = splitter.push(bytes('one\ntwo\nthree\n'));
    expect(lines.map((l) => l.text)).toEqual(['one', 'two', 'three']);
  });

  it('accepts CRLF and strips the trailing CR', () => {
    const splitter = new LineSplitter();
    const lines = splitter.push(bytes('one\r\ntwo\r\n'));
    expect(lines.map((l) => l.text)).toEqual(['one', 'two']);
  });

  it('reassembles a line split across two chunks', () => {
    const splitter = new LineSplitter();
    expect(splitter.push(bytes('hel'))).toEqual([]);
    const lines = splitter.push(bytes('lo\n'));
    expect(lines.map((l) => l.text)).toEqual(['hello']);
  });

  it('reassembles a multi-byte UTF-8 character split across two chunks', () => {
    // '€' (U+20AC) encodes to 3 bytes: e2 82 ac. Split it between the 1st and 2nd byte.
    const full = bytes('costo: €5\n');
    const splitter = new LineSplitter();
    const splitPoint = 8; // inside the multi-byte sequence
    expect(splitter.push(full.subarray(0, splitPoint))).toEqual([]);
    const lines = splitter.push(full.subarray(splitPoint));
    expect(lines.map((l) => l.text)).toEqual(['costo: €5']);
  });

  it('flags a line exceeding the PRT-07 floor as truncated but keeps splitting', () => {
    const splitter = new LineSplitter();
    const huge = 'x'.repeat(20_000);
    const lines = splitter.push(bytes(`${huge}\nshort\n`));
    expect(lines).toHaveLength(2);
    expect(lines[0]?.truncated).toBe(true);
    expect(lines[0]?.text.length).toBeLessThanOrEqual(16 * 1024);
    expect(lines[1]?.text).toBe('short');
    expect(lines[1]?.truncated).toBe(false);
    expect(Array.from(lines[1]?.raw ?? [])).toEqual(Array.from(bytes('short')));
  });

  it('exposes the raw bytes of a line unmodified', () => {
    const splitter = new LineSplitter();
    const lines = splitter.push(bytes('AB\n'));
    expect(Array.from(lines[0]?.raw ?? [])).toEqual([0x41, 0x42]);
  });
});
