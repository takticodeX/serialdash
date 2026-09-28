// Mirrors widgets/common.schema.json's `identifier` pattern (PRT-11) — a plotter label becomes a
// channel id, so it has to be one, or auto-discovery would end up declaring a channel with an id
// the rest of the protocol couldn't legally produce.
const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_.-]{0,15}$/;
const TOKEN_SPLIT = /[,\s]+/;

export type PlotterReading = Record<string, number>;

/**
 * APP-DAT-04: recognizes Arduino Serial Plotter–style plain-text lines as data — `temp:23.4
 * hum:58` (space/comma-separated `label:value` pairs) or `23.4,58` (bare numbers, positionally
 * named `ch0`, `ch1`, …). Deliberately strict: every token on the line must parse as either
 * `label:value` or a bare number, or the whole line is rejected (returns `undefined`) rather than
 * partially matched — a line that merely *contains* a colon somewhere (device debug text like
 * "Error: sensor timeout") must not get misread as one data point plus garbage. Positional
 * indices restart at 0 on every line, so which bare value lands on which channel stays consistent
 * from one line to the next as long as the device always prints the same count in the same order
 * — the same assumption the real Arduino Serial Plotter makes.
 */
export function parsePlotterLine(text: string): PlotterReading | undefined {
  const trimmed = text.trim();
  if (trimmed.length === 0) return undefined;

  const tokens = trimmed.split(TOKEN_SPLIT).filter((token) => token.length > 0);
  if (tokens.length === 0) return undefined;

  const reading: PlotterReading = {};
  let bareIndex = 0;
  for (const token of tokens) {
    const colonAt = token.indexOf(':');
    if (colonAt > 0) {
      const label = token.slice(0, colonAt);
      const value = Number(token.slice(colonAt + 1));
      if (!IDENTIFIER_PATTERN.test(label) || !Number.isFinite(value)) return undefined;
      reading[label] = value;
    } else {
      const value = Number(token);
      if (!Number.isFinite(value)) return undefined;
      reading[`ch${bareIndex}`] = value;
      bareIndex++;
    }
  }
  return reading;
}
