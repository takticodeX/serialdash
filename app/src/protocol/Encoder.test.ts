import { describe, expect, it } from 'vitest';
import { createRequestIdSequence, encodeControl, encodeHiRequest, encodePing } from './Encoder';
import { validateAppToDeviceMessage } from './Validator';

describe('Encoder', () => {
  it("encodes a hi request matching PRT-20's expected shape", () => {
    const line = encodeHiRequest();
    expect(line).toBe('@{"t":"hi","v":1}');
    const parsed: unknown = JSON.parse(line.slice(1));
    expect(parsed).toEqual({ t: 'hi', v: 1 });
    expect(validateAppToDeviceMessage(parsed)).toEqual({ valid: true, value: parsed });
  });

  it('encodes ping with the given request id', () => {
    const line = encodePing(5);
    const parsed: unknown = JSON.parse(line.slice(1));
    expect(parsed).toEqual({ t: 'ping', r: 5 });
    expect(validateAppToDeviceMessage(parsed).valid).toBe(true);
  });

  it('encodes a boolean control value', () => {
    const line = encodeControl(1, 'fan', true);
    const parsed: unknown = JSON.parse(line.slice(1));
    expect(parsed).toEqual({ t: 'c', r: 1, id: 'fan', v: true });
    expect(validateAppToDeviceMessage(parsed).valid).toBe(true);
  });

  it('encodes a numeric control value', () => {
    const line = encodeControl(17, 'pwm', 128);
    const parsed: unknown = JSON.parse(line.slice(1));
    expect(parsed).toEqual({ t: 'c', r: 17, id: 'pwm', v: 128 });
  });

  it('encodes a string control value', () => {
    const line = encodeControl(2, 'mode', 'auto');
    const parsed: unknown = JSON.parse(line.slice(1));
    expect(parsed).toEqual({ t: 'c', r: 2, id: 'mode', v: 'auto' });
  });

  it('escapes quotes and backslashes in string ids/values (PRT-10)', () => {
    const line = encodeControl(1, 'x', 'say "hi"\\');
    const parsed = JSON.parse(line.slice(1)) as { v: string };
    expect(parsed.v).toBe('say "hi"\\');
  });

  it('truncates an over-long string value to the given byte budget (PRT-43)', () => {
    const line = encodeControl(1, 'msg', 'hello world', 5);
    const parsed = JSON.parse(line.slice(1)) as { v: string };
    expect(new TextEncoder().encode(parsed.v).length).toBeLessThanOrEqual(5);
    expect(parsed.v).toBe('hello');
  });

  it('does not split a multi-byte character when truncating', () => {
    const line = encodeControl(1, 'msg', '€€€', 4); // each € is 3 bytes
    const parsed = JSON.parse(line.slice(1)) as { v: string };
    expect(parsed.v).toBe('€'); // 3 bytes fits, a second € (6 bytes) would not
  });

  describe('createRequestIdSequence', () => {
    it('increments starting from 1', () => {
      const seq = createRequestIdSequence();
      expect(seq.next()).toBe(1);
      expect(seq.next()).toBe(2);
      expect(seq.next()).toBe(3);
    });

    it('wraps back to 1 after 65535 (PRT-41)', () => {
      const seq = createRequestIdSequence();
      for (let i = 1; i < 65535; i++) seq.next();
      expect(seq.next()).toBe(65535);
      expect(seq.next()).toBe(1);
    });
  });
});
