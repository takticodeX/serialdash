import { describe, expect, it } from 'vitest';
import { parsePlotterLine } from './PlotterFormat';

describe('APP-DAT-04 Arduino Serial Plotter compatibility', () => {
  it('parses space-separated label:value pairs', () => {
    expect(parsePlotterLine('temp:23.4 hum:58')).toEqual({ temp: 23.4, hum: 58 });
  });

  it('parses comma-separated label:value pairs', () => {
    expect(parsePlotterLine('temp:23.4,hum:58')).toEqual({ temp: 23.4, hum: 58 });
  });

  it('allows whitespace after the colon — a common real-world sketch style ("temp: " + value)', () => {
    // Previously mis-tokenized: splitting on all whitespace first turned "temp: 7" into the two
    // separate tokens "temp:" and "7", and Number('') is 0 (not NaN), so this silently produced
    // {temp: 0} plus a spurious ch0 instead of {temp: 7} — found testing against a real sketch.
    expect(parsePlotterLine('temp: 7')).toEqual({ temp: 7 });
    expect(parsePlotterLine('humid: 14')).toEqual({ humid: 14 });
  });

  it('allows whitespace on both sides of the colon', () => {
    expect(parsePlotterLine('temp : 7')).toEqual({ temp: 7 });
  });

  it('parses two label:value pairs each with a space after the colon, space-separated', () => {
    expect(parsePlotterLine('temp: 23.4 hum: 58')).toEqual({ temp: 23.4, hum: 58 });
  });

  it('parses bare comma-separated numbers as positionally-named channels', () => {
    expect(parsePlotterLine('23.4,58')).toEqual({ ch0: 23.4, ch1: 58 });
  });

  it('parses bare space-separated numbers the same way', () => {
    expect(parsePlotterLine('23.4 58 12')).toEqual({ ch0: 23.4, ch1: 58, ch2: 12 });
  });

  it('parses a single bare number', () => {
    expect(parsePlotterLine('23.4')).toEqual({ ch0: 23.4 });
  });

  it('parses negative numbers', () => {
    expect(parsePlotterLine('-5.2,3')).toEqual({ ch0: -5.2, ch1: 3 });
  });

  it('mixes labeled and bare tokens on the same line', () => {
    expect(parsePlotterLine('temp:23.4 58')).toEqual({ temp: 23.4, ch0: 58 });
  });

  it('rejects a line where any token fails to parse, rather than partially matching', () => {
    // A device log line like "Error: sensor timeout" must not be read as {"Error": NaN} plus
    // garbage — the whole line has to be plotter-shaped, or none of it is treated as data.
    expect(parsePlotterLine('Error: sensor timeout')).toBeUndefined();
  });

  it('rejects plain non-numeric text', () => {
    expect(parsePlotterLine('hello world')).toBeUndefined();
  });

  it('rejects a label that is not a valid protocol identifier (PRT-11)', () => {
    expect(parsePlotterLine('not a valid id!:23')).toBeUndefined();
  });

  it('rejects NaN/Infinity-shaped tokens', () => {
    expect(parsePlotterLine('NaN,Infinity')).toBeUndefined();
  });

  it('rejects an empty line', () => {
    expect(parsePlotterLine('')).toBeUndefined();
    expect(parsePlotterLine('   ')).toBeUndefined();
  });

  it('trims surrounding whitespace', () => {
    expect(parsePlotterLine('  temp:23.4  ')).toEqual({ temp: 23.4 });
  });
});
