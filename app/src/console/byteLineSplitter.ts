// PRT-07 floor: the app must accept device→app lines of at least 16384 bytes; longer lines are
// truncated and flagged. This splitter also applies that limit to plain console text, since a
// runaway line would hurt UI performance regardless of whether it's a protocol message.
const MAX_LINE_BYTES = 16 * 1024;

export interface SplitLine {
  text: string;
  raw: Uint8Array;
  truncated: boolean;
}

function concatBytes(parts: Uint8Array[], total: number): Uint8Array {
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/**
 * Incremental bytes→lines splitter, safe across chunk boundaries (PRT-01). Splits on the raw
 * byte `\n` (0x0A) *before* any UTF-8 decoding — continuation/lead bytes of a multi-byte
 * character are always ≥ 0x80 and can never be confused with it, so this can't split a character
 * in half even if a chunk boundary lands mid-sequence. A trailing `\r` is stripped at the byte
 * level (accepts `\r\n`). Keeping the raw bytes per line is also what makes the hex view
 * (APP-CSL-08) byte-accurate rather than a re-encoding of the decoded text.
 *
 * This is deliberately not the protocol-aware `LineSplitter` (that module, and its QA-01 test
 * suite, arrive in M2 under `protocol/`) — it only implements the framing rules that already
 * apply to plain console text before any protocol parsing exists.
 */
export class ByteLineSplitter {
  private readonly decoder = new TextDecoder('utf-8');
  private chunks: Uint8Array[] = [];
  private byteLength = 0;
  private truncated = false;

  push(chunk: Uint8Array): SplitLine[] {
    const lines: SplitLine[] = [];
    let start = 0;
    for (let i = 0; i < chunk.length; i++) {
      if (chunk[i] === 0x0a) {
        this.append(chunk.subarray(start, i));
        lines.push(this.flushLine());
        start = i + 1;
      }
    }
    if (start < chunk.length) this.append(chunk.subarray(start));
    return lines;
  }

  private append(segment: Uint8Array): void {
    if (segment.length === 0) return;
    const room = MAX_LINE_BYTES - this.byteLength;
    if (room <= 0) {
      this.truncated = true;
      return;
    }
    if (segment.length > room) {
      this.chunks.push(segment.subarray(0, room));
      this.byteLength += room;
      this.truncated = true;
      return;
    }
    this.chunks.push(segment);
    this.byteLength += segment.length;
  }

  private flushLine(): SplitLine {
    let raw = concatBytes(this.chunks, this.byteLength);
    if (raw.length > 0 && raw[raw.length - 1] === 0x0d) raw = raw.subarray(0, raw.length - 1);
    const line: SplitLine = { text: this.decoder.decode(raw), raw, truncated: this.truncated };
    this.chunks = [];
    this.byteLength = 0;
    this.truncated = false;
    return line;
  }
}
