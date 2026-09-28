// A `label:value` field, with optional whitespace on either side of the colon — real sketches
// commonly write `"temp: " + String(v)`, not just `"temp:" + String(v)` — or a bare number.
// `[A-Za-z_][A-Za-z0-9_.-]{0,15}` mirrors widgets/common.schema.json's `identifier` pattern
// (PRT-11): a label becomes a channel id, so it has to be one, or auto-discovery would end up
// declaring a channel with an id the rest of the protocol couldn't legally produce.
const FIELD_PATTERN = /([A-Za-z_][A-Za-z0-9_.-]{0,15})\s*:\s*(-?\d+(?:\.\d+)?)|(-?\d+(?:\.\d+)?)/g;
const SEPARATOR_ONLY = /^[,\s]*$/;

export type PlotterReading = Record<string, number>;

/**
 * APP-DAT-04: recognizes Arduino Serial Plotter–style plain-text lines as data — `temp:23.4
 * hum:58` (space/comma-separated `label:value` pairs, space around the colon optional) or
 * `23.4,58` (bare numbers, positionally named `ch0`, `ch1`, …). Deliberately strict: every
 * character on the line has to belong to either a recognized field or a separator (comma/
 * whitespace) between fields — a line that merely *contains* a colon and a digit somewhere
 * (device debug text like "Error: sensor timeout 42") must not get misread as one data point
 * plus garbage; the whole line is rejected (returns `undefined`) instead. Positional indices
 * restart at 0 on every line, so which bare value lands on which channel stays consistent from
 * one line to the next as long as the device always prints the same count in the same order —
 * the same assumption the real Arduino Serial Plotter makes.
 */
export function parsePlotterLine(text: string): PlotterReading | undefined {
  const trimmed = text.trim();
  if (trimmed.length === 0) return undefined;

  const reading: PlotterReading = {};
  let bareIndex = 0;
  let cursor = 0;
  let matchedAny = false;

  FIELD_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = FIELD_PATTERN.exec(trimmed)) !== null) {
    // Whatever sits between the previous field and this one must be pure separator — anything
    // else (letters, stray punctuation) means the line isn't cleanly plotter-shaped after all.
    if (!SEPARATOR_ONLY.test(trimmed.slice(cursor, match.index))) return undefined;
    matchedAny = true;

    const [, label, labeledValue, bareValue] = match;
    if (label !== undefined) {
      reading[label] = Number(labeledValue);
    } else {
      reading[`ch${bareIndex}`] = Number(bareValue);
      bareIndex++;
    }
    cursor = match.index + match[0].length;
  }

  if (!matchedAny) return undefined;
  if (!SEPARATOR_ONLY.test(trimmed.slice(cursor))) return undefined; // trailing garbage

  return reading;
}
