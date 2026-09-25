/**
 * Builds app→device protocol lines (SPEC.md §3.4). Every message is a flat object with fields in
 * the order `t`, `r`, `id`, `v` (PRT-40) — built directly as a JSON string rather than via
 * `JSON.stringify` on an object literal, since object key order isn't part of the JS spec's
 * guarantees in the way string concatenation is.
 *
 * Returned lines do not include the trailing line terminator — the caller encodes bytes and
 * appends `\n` (PRT-01).
 */

/** PRT-41: an incremental request id, 1..65535, wrapping back to 1. */
export interface RequestIdSequence {
  next: () => number;
}

export function createRequestIdSequence(): RequestIdSequence {
  let current = 0;
  return {
    next(): number {
      current = current >= 65535 ? 1 : current + 1;
      return current;
    },
  };
}

export function encodeHiRequest(): string {
  return '@{"t":"hi","v":1}';
}

export function encodePing(r: number): string {
  return `@{"t":"ping","r":${r}}`;
}

/** Truncates a string to at most `maxBytes` UTF-8 bytes without splitting a multi-byte character
 * (PRT-43). This bounds the *value*, not the fully-escaped JSON line — a reasonable
 * approximation given control sending isn't wired into the UI until M4, where it can be
 * tightened against real `rx` values from the handshake if needed. */
function truncateToUtf8Bytes(text: string, maxBytes: number): string {
  const encoder = new TextEncoder();
  if (encoder.encode(text).length <= maxBytes) return text;
  let end = Math.min(text.length, maxBytes);
  while (end > 0 && encoder.encode(text.slice(0, end)).length > maxBytes) end--;
  return text.slice(0, end);
}

export type ControlValue = number | boolean | string;

export function encodeControl(
  r: number,
  id: string,
  v: ControlValue,
  maxValueBytes?: number,
): string {
  const value =
    typeof v === 'string' && maxValueBytes !== undefined
      ? truncateToUtf8Bytes(v, maxValueBytes)
      : v;
  return `@{"t":"c","r":${r},"id":${JSON.stringify(id)},"v":${JSON.stringify(value)}}`;
}
