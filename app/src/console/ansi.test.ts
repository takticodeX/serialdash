import { describe, expect, it } from 'vitest';
import { parseAnsi } from './ansi';

describe('APP-CSL-06 ANSI SGR parsing', () => {
  it('parses plain text with no escapes as a single segment', () => {
    expect(parseAnsi('hello')).toEqual([
      { text: 'hello', bold: false, fg: undefined, bg: undefined },
    ]);
  });

  it('applies a foreground color until reset', () => {
    const segments = parseAnsi('\x1b[31mred\x1b[0mplain');
    expect(segments).toEqual([
      { text: 'red', bold: false, fg: 'red', bg: undefined },
      { text: 'plain', bold: false, fg: undefined, bg: undefined },
    ]);
  });

  it('combines bold with a color from a single SGR sequence', () => {
    const segments = parseAnsi('\x1b[1;32mbold green\x1b[22m');
    expect(segments).toEqual([{ text: 'bold green', bold: true, fg: 'green', bg: undefined }]);
  });

  it('supports bright colors and background colors', () => {
    const segments = parseAnsi('\x1b[93;44mtext\x1b[0m');
    expect(segments).toEqual([{ text: 'text', bold: false, fg: 'brightYellow', bg: 'blue' }]);
  });

  it('treats a bare "\\x1b[m" as a reset', () => {
    const segments = parseAnsi('\x1b[31mred\x1b[mplain');
    expect(segments).toEqual([
      { text: 'red', bold: false, fg: 'red', bg: undefined },
      { text: 'plain', bold: false, fg: undefined, bg: undefined },
    ]);
  });
});
