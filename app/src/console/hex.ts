/** APP-CSL-08: raw-byte hex view, for debugging binary protocols. */
export function toHexDump(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(' ');
  const ascii = Array.from(bytes, (b) =>
    b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : '.',
  ).join('');
  return `${hex}  |${ascii}|`;
}
