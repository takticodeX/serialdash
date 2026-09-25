/** ANSI SGR parsing — APP-CSL-06: base 16 colors + bold. Produces plain data (no HTML), rendered
 * as React elements by AnsiLine.tsx so untrusted device output is never interpreted as markup
 * (APP-NFR-06). */

export interface AnsiSegment {
  text: string;
  bold: boolean;
  fg: AnsiColorName | undefined;
  bg: AnsiColorName | undefined;
}

export type AnsiColorName =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'brightBlack'
  | 'brightRed'
  | 'brightGreen'
  | 'brightYellow'
  | 'brightBlue'
  | 'brightMagenta'
  | 'brightCyan'
  | 'brightWhite';

const FG_CODES: Record<number, AnsiColorName> = {
  30: 'black',
  31: 'red',
  32: 'green',
  33: 'yellow',
  34: 'blue',
  35: 'magenta',
  36: 'cyan',
  37: 'white',
  90: 'brightBlack',
  91: 'brightRed',
  92: 'brightGreen',
  93: 'brightYellow',
  94: 'brightBlue',
  95: 'brightMagenta',
  96: 'brightCyan',
  97: 'brightWhite',
};

const BG_CODES: Record<number, AnsiColorName> = {
  40: 'black',
  41: 'red',
  42: 'green',
  43: 'yellow',
  44: 'blue',
  45: 'magenta',
  46: 'cyan',
  47: 'white',
  100: 'brightBlack',
  101: 'brightRed',
  102: 'brightGreen',
  103: 'brightYellow',
  104: 'brightBlue',
  105: 'brightMagenta',
  106: 'brightCyan',
  107: 'brightWhite',
};

// eslint-disable-next-line no-control-regex -- matching the ANSI escape byte is the point here.
const SGR_RE = /\x1b\[([0-9;]*)m/g;

export function parseAnsi(input: string): AnsiSegment[] {
  const segments: AnsiSegment[] = [];
  let bold = false;
  let fg: AnsiColorName | undefined;
  let bg: AnsiColorName | undefined;
  let lastIndex = 0;

  SGR_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SGR_RE.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: input.slice(lastIndex, match.index), bold, fg, bg });
    }

    const params = match[1] ?? '';
    const codes = params.length > 0 ? params.split(';').map(Number) : [0];
    for (const code of codes) {
      if (code === 0) {
        bold = false;
        fg = undefined;
        bg = undefined;
      } else if (code === 1) {
        bold = true;
      } else if (code === 22) {
        bold = false;
      } else if (code === 39) {
        fg = undefined;
      } else if (code === 49) {
        bg = undefined;
      } else if (code in FG_CODES) {
        fg = FG_CODES[code];
      } else if (code in BG_CODES) {
        bg = BG_CODES[code];
      }
    }

    lastIndex = SGR_RE.lastIndex;
  }

  if (lastIndex < input.length) {
    segments.push({ text: input.slice(lastIndex), bold, fg, bg });
  }

  return segments;
}
