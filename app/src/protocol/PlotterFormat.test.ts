import { describe, expect, it } from 'vitest';
import { parsePlotterLine } from './PlotterFormat';

function data(reading: Record<string, unknown>): { kind: 'data'; reading: typeof reading } {
  return { kind: 'data', reading };
}
const notPlotterText = { kind: 'notPlotterText' } as const;

describe('APP-DAT-04 Arduino Serial Plotter compatibility (numbers only)', () => {
  it('parses space-separated label:value pairs', () => {
    expect(parsePlotterLine('temp:23.4 hum:58')).toEqual(data({ temp: 23.4, hum: 58 }));
  });

  it('parses comma-separated label:value pairs', () => {
    expect(parsePlotterLine('temp:23.4,hum:58')).toEqual(data({ temp: 23.4, hum: 58 }));
  });

  it('allows whitespace after the colon — a common real-world sketch style ("temp: " + value)', () => {
    // Previously mis-tokenized: splitting on all whitespace first turned "temp: 7" into the two
    // separate tokens "temp:" and "7", and Number('') is 0 (not NaN), so this silently produced
    // {temp: 0} plus a spurious ch0 instead of {temp: 7} — found testing against a real sketch.
    expect(parsePlotterLine('temp: 7')).toEqual(data({ temp: 7 }));
    expect(parsePlotterLine('humid: 14')).toEqual(data({ humid: 14 }));
  });

  it('allows whitespace on both sides of the colon', () => {
    expect(parsePlotterLine('temp : 7')).toEqual(data({ temp: 7 }));
  });

  it('parses two label:value pairs each with a space after the colon, space-separated', () => {
    expect(parsePlotterLine('temp: 23.4 hum: 58')).toEqual(data({ temp: 23.4, hum: 58 }));
  });

  it('parses bare comma-separated numbers as positionally-named channels', () => {
    expect(parsePlotterLine('23.4,58')).toEqual(data({ ch0: 23.4, ch1: 58 }));
  });

  it('parses bare space-separated numbers the same way', () => {
    expect(parsePlotterLine('23.4 58 12')).toEqual(data({ ch0: 23.4, ch1: 58, ch2: 12 }));
  });

  it('parses a single bare number', () => {
    expect(parsePlotterLine('23.4')).toEqual(data({ ch0: 23.4 }));
  });

  it('parses negative numbers', () => {
    expect(parsePlotterLine('-5.2,3')).toEqual(data({ ch0: -5.2, ch1: 3 }));
  });

  it('mixes labeled and bare tokens on the same line', () => {
    expect(parsePlotterLine('temp:23.4 58')).toEqual(data({ temp: 23.4, ch0: 58 }));
  });

  it('rejects a line where any token fails to parse, rather than partially matching', () => {
    // A device log line like "Error: sensor timeout" must not be read as {"Error": NaN} plus
    // garbage — the whole line has to be plotter-shaped, or none of it is treated as data. It
    // must also NOT be reported as `malformed` (APP-DAT-07) — "sensor" isn't `"`/`[`/`{`, so this
    // was never an unambiguous attempt at a typed value, just an ordinary debug line.
    expect(parsePlotterLine('Error: sensor timeout')).toEqual(notPlotterText);
  });

  it('rejects plain non-numeric text', () => {
    expect(parsePlotterLine('hello world')).toEqual(notPlotterText);
  });

  it('rejects a label that is not a valid protocol identifier', () => {
    expect(parsePlotterLine('not a valid id!:23')).toEqual(notPlotterText);
  });

  it('rejects NaN/Infinity-shaped tokens', () => {
    expect(parsePlotterLine('NaN,Infinity')).toEqual(notPlotterText);
  });

  it('rejects an empty line', () => {
    expect(parsePlotterLine('')).toEqual(notPlotterText);
    expect(parsePlotterLine('   ')).toEqual(notPlotterText);
  });

  it('trims surrounding whitespace', () => {
    expect(parsePlotterLine('  temp:23.4  ')).toEqual(data({ temp: 23.4 }));
  });

  it('silently rejects the whole line when a valid field is followed by unrelated prose', () => {
    // "x:5" matches cleanly, but "and y:10 is good" isn't a clean separator/field sequence — the
    // conservative choice is to drop the whole line rather than report it as malformed (APP-DAT-07
    // is reserved for unambiguous typed-value attempts, not loosely plotter-shaped prose).
    expect(parsePlotterLine('x:5 and y:10 is good')).toEqual(notPlotterText);
    expect(parsePlotterLine('Connected, signal:5 bars')).toEqual(notPlotterText);
  });
});

describe('APP-DAT-06 extended text: booleans, strings, arrays, objects', () => {
  it('parses a labeled boolean', () => {
    expect(parsePlotterLine('led:false')).toEqual(data({ led: false }));
    expect(parsePlotterLine('led:true')).toEqual(data({ led: true }));
  });

  it('requires a word boundary after true/false', () => {
    expect(parsePlotterLine('mode:truest')).toEqual(notPlotterText);
  });

  it('parses a labeled quoted string', () => {
    expect(parsePlotterLine('status:"heating"')).toEqual(data({ status: 'heating' }));
  });

  it('parses a quoted string containing spaces and a colon', () => {
    expect(parsePlotterLine('status:"heating fast: stage 2"')).toEqual(
      data({ status: 'heating fast: stage 2' }),
    );
  });

  it('parses a quoted string with a standard JSON escape', () => {
    expect(parsePlotterLine('status:"say \\"hi\\""')).toEqual(data({ status: 'say "hi"' }));
  });

  it('parses a numeric array of any length, auto-discovery decides xy vs bar later', () => {
    expect(parsePlotterLine('position:[-9.90,1.41]')).toEqual(data({ position: [-9.9, 1.41] }));
    expect(parsePlotterLine('spectrum:[55,26,11,20,47]')).toEqual(
      data({ spectrum: [55, 26, 11, 20, 47] }),
    );
  });

  it('parses a flat object of number/string values', () => {
    expect(parsePlotterLine('sensor:{"temp":22.8,"hum":53}')).toEqual(
      data({ sensor: { temp: 22.8, hum: 53 } }),
    );
    expect(parsePlotterLine('sensor:{"mode":"auto","level":3}')).toEqual(
      data({ sensor: { mode: 'auto', level: 3 } }),
    );
  });

  it('mixes typed and plain-number fields on the same line', () => {
    expect(parsePlotterLine('temperature:24.99 led:false status:"heating"')).toEqual(
      data({ temperature: 24.99, led: false, status: 'heating' }),
    );
  });

  it('allows whitespace inside array/object literals', () => {
    expect(parsePlotterLine('pos:[1, 2]')).toEqual(data({ pos: [1, 2] }));
    expect(parsePlotterLine('sensor:{"a": 1, "b": 2}')).toEqual(data({ sensor: { a: 1, b: 2 } }));
  });

  it('allows an empty array or object', () => {
    expect(parsePlotterLine('tags:[]')).toEqual(data({ tags: [] }));
    expect(parsePlotterLine('sensor:{}')).toEqual(data({ sensor: {} }));
  });
});

describe('APP-DAT-07 malformed typed values — reported, not silently dropped', () => {
  it('reports an unterminated string', () => {
    const result = parsePlotterLine('status:"heating');
    expect(result.kind).toBe('malformed');
    expect(result).toMatchObject({ reason: expect.stringContaining('status') as unknown });
  });

  it('reports an unterminated array', () => {
    const result = parsePlotterLine('pos:[1,2');
    expect(result.kind).toBe('malformed');
  });

  it('reports an unterminated object', () => {
    const result = parsePlotterLine('sensor:{"a":1');
    expect(result.kind).toBe('malformed');
  });

  it('reports an array containing a non-numeric element', () => {
    const result = parsePlotterLine('pos:[1,"a"]');
    expect(result.kind).toBe('malformed');
  });

  it('reports an object with a boolean value — not a valid channelValue shape', () => {
    const result = parsePlotterLine('sensor:{"temp":22.8,"ok":true}');
    expect(result.kind).toBe('malformed');
  });

  it('reports a nested array inside an array', () => {
    const result = parsePlotterLine('pos:[1,[2,3]]');
    expect(result.kind).toBe('malformed');
  });

  it('reports a nested object inside an object', () => {
    const result = parsePlotterLine('sensor:{"a":{"b":1}}');
    expect(result.kind).toBe('malformed');
  });

  it('reports invalid array syntax', () => {
    const result = parsePlotterLine('pos:[1,,2]');
    expect(result.kind).toBe('malformed');
  });
});
