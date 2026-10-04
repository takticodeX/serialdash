import type { DataMessage } from './generated/index.js';

// A `label:value` field, with optional whitespace on either side of the colon — real sketches
// commonly write `"temp: " + String(v)`, not just `"temp:" + String(v)` — or a bare number.
// `[A-Za-z_][A-Za-z0-9_.-]{0,15}` mirrors widgets/common.schema.json's `identifier` pattern: a
// label becomes a channel id, so it has to be one, or auto-discovery would end up declaring a
// channel with an id the rest of the protocol couldn't legally produce.
const IDENTIFIER_RE = /^[A-Za-z_][A-Za-z0-9_.-]{0,15}/;
const NUMBER_RE = /^-?\d+(?:\.\d+)?/;
const BOOL_RE = /^(true|false)(?![A-Za-z0-9_])/;

type PlotterValue = DataMessage['d'][string];

/** One line's worth of channel id -> value pairs, as recognized by {@link parsePlotterLine}. */
export type PlotterReading = Record<string, PlotterValue>;

/**
 * The outcome of {@link parsePlotterLine} for one line:
 * - `data` — a clean match, ready to feed into auto-discovery like a real `d` message (APP-DAT-04/06).
 * - `malformed` — the line clearly *attempted* a typed value (started with `"`, `[`, or `{`
 *   right after a `label:`) but that value is broken — worth surfacing (APP-DAT-07), not silently
 *   dropping.
 * - `notPlotterText` — nothing here looks like an attempted field at all; ordinary free text.
 */
export type PlotterParseResult =
  | { kind: 'data'; reading: PlotterReading }
  | { kind: 'malformed'; reason: string }
  | { kind: 'notPlotterText' };

function skipFieldSeparators(s: string, pos: number): number {
  let i = pos;
  while (i < s.length && (s[i] === ' ' || s[i] === '\t' || s[i] === ',')) i++;
  return i;
}

function skipInlineWs(s: string, pos: number): number {
  let i = pos;
  while (i < s.length && (s[i] === ' ' || s[i] === '\t')) i++;
  return i;
}

/** Finds the end (exclusive) of a quoted string starting at `s[pos]` (`"`), honoring `\`-escaped
 * characters so an escaped quote doesn't end it early. Returns -1 if unterminated. */
function skipQuotedString(s: string, pos: number): number {
  let i = pos + 1;
  while (i < s.length) {
    if (s[i] === '\\') {
      i += 2;
      continue;
    }
    if (s[i] === '"') return i + 1;
    i++;
  }
  return -1;
}

/** Finds the end (exclusive) of a bracketed value starting at `s[pos]` (`open`), stopping at the
 * first unescaped `close` — the grammar never nests arrays/objects, so encountering another
 * `[`/`{` before that point means the whole construct is rejected, not recursed into. Quoted
 * strings are skipped over bodily (their contents don't count as brackets). Returns -1 if
 * unterminated or if nesting is encountered. */
function findBalancedEnd(s: string, pos: number, open: string, close: string): number {
  let i = pos + 1;
  while (i < s.length) {
    const c = s[i];
    if (c === '"') {
      const end = skipQuotedString(s, i);
      if (end === -1) return -1;
      i = end;
      continue;
    }
    if (c === '[' || c === '{') return -1; // nested structure — not supported (APP-DAT-06)
    if (c === close) return i + 1;
    i++;
  }
  return -1;
}

type ValueResult =
  | { kind: 'ok'; value: PlotterValue; nextPos: number }
  | { kind: 'malformed'; reason: string }
  | { kind: 'none' };

/** Parses the value half of a `label:value` field at `s[pos]`. `none` means `s[pos]` isn't the
 * start of any recognized value shape at all (so the caller's field attempt silently fails rather
 * than being flagged — see {@link tryParseField}); `malformed` means a typed value (`"`/`[`/`{`)
 * was unambiguously started but didn't finish correctly. */
function tryParseValue(s: string, pos: number): ValueResult {
  if (pos >= s.length) return { kind: 'none' };
  const c = s[pos];

  if (c === '"') {
    const end = skipQuotedString(s, pos);
    if (end === -1) return { kind: 'malformed', reason: 'unterminated string' };
    try {
      return { kind: 'ok', value: JSON.parse(s.slice(pos, end)) as string, nextPos: end };
    } catch {
      return { kind: 'malformed', reason: 'invalid string escape sequence' };
    }
  }

  if (c === '[') {
    const end = findBalancedEnd(s, pos, '[', ']');
    if (end === -1) return { kind: 'malformed', reason: 'unterminated or nested array' };
    let parsed: unknown;
    try {
      parsed = JSON.parse(s.slice(pos, end));
    } catch {
      return { kind: 'malformed', reason: 'invalid array syntax' };
    }
    if (!Array.isArray(parsed) || !parsed.every((el) => typeof el === 'number')) {
      return { kind: 'malformed', reason: 'array must contain only numbers' };
    }
    return { kind: 'ok', value: parsed as number[], nextPos: end };
  }

  if (c === '{') {
    const end = findBalancedEnd(s, pos, '{', '}');
    if (end === -1) return { kind: 'malformed', reason: 'unterminated or nested object' };
    let parsed: unknown;
    try {
      parsed = JSON.parse(s.slice(pos, end));
    } catch {
      return { kind: 'malformed', reason: 'invalid object syntax' };
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { kind: 'malformed', reason: 'invalid object' };
    }
    for (const v of Object.values(parsed as Record<string, unknown>)) {
      if (typeof v !== 'number' && typeof v !== 'string') {
        return {
          kind: 'malformed',
          reason:
            'object values must be numbers or strings (no booleans, arrays, or nested objects)',
        };
      }
    }
    return { kind: 'ok', value: parsed as Record<string, number | string>, nextPos: end };
  }

  const boolMatch = BOOL_RE.exec(s.slice(pos));
  if (boolMatch) {
    return { kind: 'ok', value: boolMatch[1] === 'true', nextPos: pos + boolMatch[1]!.length };
  }

  const numMatch = NUMBER_RE.exec(s.slice(pos));
  if (numMatch) {
    return { kind: 'ok', value: Number(numMatch[0]), nextPos: pos + numMatch[0].length };
  }

  return { kind: 'none' };
}

type FieldResult =
  | { kind: 'ok'; label: string | undefined; value: PlotterValue; nextPos: number }
  | { kind: 'malformed'; reason: string }
  | { kind: 'none' };

function tryParseField(s: string, pos: number): FieldResult {
  const idMatch = IDENTIFIER_RE.exec(s.slice(pos));
  if (idMatch) {
    const label = idMatch[0];
    let p = skipInlineWs(s, pos + label.length);
    if (s[p] === ':') {
      p = skipInlineWs(s, p + 1);
      const valueResult = tryParseValue(s, p);
      if (valueResult.kind === 'malformed') {
        return { kind: 'malformed', reason: `\`${label}\`: ${valueResult.reason}` };
      }
      if (valueResult.kind === 'ok') {
        return { kind: 'ok', label, value: valueResult.value, nextPos: valueResult.nextPos };
      }
      // `label:` was found, but what follows isn't the start of any recognized value (e.g. a
      // bare word) — not a field at all, same as if the colon had never matched (keeps ordinary
      // debug text like "Error: sensor timeout" from being flagged as a broken data line).
      return { kind: 'none' };
    }
    // Identifier matched but no ':' follows — not a field; fall through to a bare-number attempt.
  }

  const numMatch = NUMBER_RE.exec(s.slice(pos));
  if (numMatch) {
    return {
      kind: 'ok',
      label: undefined,
      value: Number(numMatch[0]),
      nextPos: pos + numMatch[0].length,
    };
  }

  return { kind: 'none' };
}

/**
 * APP-DAT-04/06: recognizes Arduino Serial Plotter–style plain-text lines as data — `temp:23.4
 * hum:58` or `23.4,58` (bare numbers, positionally named `ch0`, `ch1`, …) — and, beyond what the
 * real Arduino IDE's own Serial Plotter understands, labeled booleans, quoted strings, flat
 * numeric arrays, and flat label→number/string objects (`led:false`, `status:"heating"`,
 * `pos:[1,2]`, `sensor:{"temp":22.8,"hum":53}`). Unlabeled/positional values stay numbers-only,
 * matching the real Plotter's own CSV form exactly.
 *
 * Deliberately strict: a line only becomes `data` when every character on it belongs to a
 * recognized field or a separator (comma/whitespace) between fields — anything else makes the
 * whole line `notPlotterText` (silently treated as free text), the same safety net as before this
 * grammar grew typed values. The one exception is `malformed`: when a `label:` is unambiguously
 * followed by `"`, `[`, or `{` (there is no other legal reading of that character at that
 * position) but the value doesn't finish correctly, that's surfaced rather than silently dropped
 * — see APP-DAT-07 for what the caller does with it.
 */
export function parsePlotterLine(text: string): PlotterParseResult {
  const trimmed = text.trim();
  if (trimmed.length === 0) return { kind: 'notPlotterText' };

  const reading: PlotterReading = {};
  let bareIndex = 0;
  let pos = 0;
  let matchedAny = false;

  while (pos < trimmed.length) {
    pos = skipFieldSeparators(trimmed, pos);
    if (pos >= trimmed.length) break;

    const field = tryParseField(trimmed, pos);

    if (field.kind === 'malformed') return { kind: 'malformed', reason: field.reason };
    if (field.kind === 'none') {
      // Whatever's here doesn't fit the grammar — reject the whole line silently, same as today
      // (a partially-matched prefix, like `x:5` before this point, is discarded along with it).
      return { kind: 'notPlotterText' };
    }

    matchedAny = true;
    if (field.label !== undefined) {
      reading[field.label] = field.value;
    } else {
      reading[`ch${bareIndex}`] = field.value;
      bareIndex++;
    }
    pos = field.nextPos;
  }

  if (!matchedAny) return { kind: 'notPlotterText' };
  return { kind: 'data', reading };
}
