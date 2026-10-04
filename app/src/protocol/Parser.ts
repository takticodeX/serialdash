import type { DeviceToAppMessage } from './generated/index.js';
import type { SplitLine } from './LineSplitter';
import { validateDeviceToAppMessage } from './Validator';

interface ParsedLineBase {
  raw: Uint8Array;
  truncated: boolean;
  /** Original decoded line text — always present, even for `message`, so the console can show
   * protocol lines dimmed when the user opts in (APP-CSL-04). */
  text: string;
}

/** The outcome of {@link parseLine} for one device→app line — plain text, a validated protocol
 * message, or a protocol error, discriminated by `kind`. */
export type ParsedLine =
  | (ParsedLineBase & { kind: 'text' })
  | (ParsedLineBase & { kind: 'message'; message: DeviceToAppMessage })
  | (ParsedLineBase & { kind: 'protocolError'; reason: string });

const PROTOCOL_PREFIX = '@{';

/**
 * Turns one split line into plain text, a validated protocol message, or a protocol error —
 * never silently drops a malformed `@{...}` line (PRT-04).
 *
 * - PRT-02/03: a line not starting with `@{` is free text, full stop — not an error.
 * - PRT-04: `@{` followed by invalid JSON, or JSON that fails the schema, is a protocol error
 *   with the reason, not a silently dropped line.
 * - PRT-05/06: unknown message types and unknown fields are the schema's job to tolerate
 *   (see /protocol/schema) — Parser itself has no opinion on them beyond "does it validate".
 */
export function parseLine(line: SplitLine): ParsedLine {
  const base: ParsedLineBase = { raw: line.raw, truncated: line.truncated, text: line.text };

  if (!line.text.startsWith(PROTOCOL_PREFIX)) {
    return { ...base, kind: 'text' };
  }

  const payload = line.text.slice(1); // drop the leading '@', keep the JSON object text
  let data: unknown;
  try {
    data = JSON.parse(payload);
  } catch (err) {
    return { ...base, kind: 'protocolError', reason: `malformed JSON: ${(err as Error).message}` };
  }

  const result = validateDeviceToAppMessage(data);
  if (!result.valid) {
    return { ...base, kind: 'protocolError', reason: result.errors };
  }

  return { ...base, kind: 'message', message: result.value };
}
