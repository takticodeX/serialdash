import { describe, expect, it } from 'vitest';
import { friendlyUsbName } from './usbNames';

describe('APP-CON-02 USB VID/PID friendly names', () => {
  it('recognizes CH340 by exact VID/PID', () => {
    expect(friendlyUsbName(0x1a86, 0x7523)).toBe('CH340');
  });

  it('recognizes CP210x', () => {
    expect(friendlyUsbName(0x10c4, 0xea60)).toBe('CP210x');
  });

  it('falls back to a vendor-only match for Arduino (any PID)', () => {
    expect(friendlyUsbName(0x2341, 0x9999)).toBe('Arduino');
  });

  it('returns undefined for an unrecognized vendor', () => {
    expect(friendlyUsbName(0xffff, 0x0001)).toBeUndefined();
  });

  it('returns undefined when no VID is present at all', () => {
    expect(friendlyUsbName(undefined, undefined)).toBeUndefined();
  });
});
