import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SimulatorTransport } from './simulatorTransport';
import { registerBuiltinWidgets } from '../widgets/index';

registerBuiltinWidgets();

function collectLines(transport: SimulatorTransport): { lines: string[]; unsubscribe: () => void } {
  const lines: string[] = [];
  const decoder = new TextDecoder();
  const unsubscribe = transport.onData((chunk) => {
    for (const line of decoder.decode(chunk).split('\n')) {
      if (line) lines.push(line);
    }
  });
  return { lines, unsubscribe };
}

async function connectAndDrainHandshake(transport: SimulatorTransport): Promise<void> {
  const connectPromise = transport.connect();
  await vi.advanceTimersByTimeAsync(50);
  await connectPromise;
}

describe('SimulatorTransport bidirectional behavior (SPEC.md §6.5, PRT-20, §3.5 rule 5)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('responds to a ping with a pong carrying the same r', async () => {
    const transport = new SimulatorTransport();
    await connectAndDrainHandshake(transport);
    const { lines } = collectLines(transport);

    await transport.write(new TextEncoder().encode('@{"t":"ping","r":42}\n'));
    await vi.advanceTimersByTimeAsync(200);

    expect(lines).toContain('@{"t":"pong","r":42}');
  });

  it('redeclares hi and every widget when it receives a hi request', async () => {
    const transport = new SimulatorTransport();
    await connectAndDrainHandshake(transport);
    const { lines } = collectLines(transport);

    await transport.write(new TextEncoder().encode('@{"t":"hi","v":1}\n'));

    expect(lines.filter((l) => l.includes('"t":"hi"'))).toHaveLength(1);
    expect(lines.filter((l) => l.includes('"t":"w"')).length).toBeGreaterThanOrEqual(3);
  });

  it('clamps a slider control to its declared range and echoes the clamped value', async () => {
    const transport = new SimulatorTransport();
    await connectAndDrainHandshake(transport);
    const { lines } = collectLines(transport);

    await transport.write(
      new TextEncoder().encode('@{"t":"c","r":1,"id":"demo-slider","v":99999}\n'),
    );
    await vi.advanceTimersByTimeAsync(200);

    expect(lines).toContain('@{"t":"ack","r":1,"ok":true}');
    expect(lines.some((l) => /"t":"d","d":\{"demo-slider":255\}/.exec(l))).toBe(true);
  });

  it('toggles the switch and echoes the new state', async () => {
    const transport = new SimulatorTransport();
    await connectAndDrainHandshake(transport);
    const { lines } = collectLines(transport);

    await transport.write(
      new TextEncoder().encode('@{"t":"c","r":1,"id":"demo-switch","v":true}\n'),
    );
    await vi.advanceTimersByTimeAsync(200);

    expect(lines).toContain('@{"t":"ack","r":1,"ok":true}');
    expect(lines).toContain('@{"t":"d","d":{"demo-switch":true}}');
  });

  it("rejects the button while the switch is on, mirroring §6.5's own onControl example", async () => {
    const transport = new SimulatorTransport();
    await connectAndDrainHandshake(transport);

    await transport.write(
      new TextEncoder().encode('@{"t":"c","r":1,"id":"demo-switch","v":true}\n'),
    );
    await vi.advanceTimersByTimeAsync(200);

    const { lines } = collectLines(transport);
    await transport.write(
      new TextEncoder().encode('@{"t":"c","r":2,"id":"demo-button","v":true}\n'),
    );
    await vi.advanceTimersByTimeAsync(200);

    expect(lines.some((l) => l.includes('"r":2') && l.includes('"ok":false'))).toBe(true);
    expect(lines.some((l) => l.includes('"demo-button"') && l.includes('"t":"d"'))).toBe(false);
  });

  it('accepts the button once the switch is off', async () => {
    const transport = new SimulatorTransport();
    await connectAndDrainHandshake(transport);
    const { lines } = collectLines(transport);

    await transport.write(
      new TextEncoder().encode('@{"t":"c","r":1,"id":"demo-button","v":true}\n'),
    );
    await vi.advanceTimersByTimeAsync(200);

    expect(lines).toContain('@{"t":"ack","r":1,"ok":true}');
    expect(lines).toContain('@{"t":"d","d":{"demo-button":true}}');
  });

  it('ignores malformed or non-protocol lines instead of throwing', async () => {
    const transport = new SimulatorTransport();
    await connectAndDrainHandshake(transport);
    await expect(transport.write(new TextEncoder().encode('not json\n'))).resolves.toBeUndefined();
    await expect(
      transport.write(new TextEncoder().encode('@{not valid json}\n')),
    ).resolves.toBeUndefined();
  });
});

describe('APP-SIM-02 scenarios', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function declaredKinds(lines: string[]): string[] {
    return lines
      .filter((l) => l.includes('"t":"w"'))
      .map((l) => /"k":"([a-z]+)"/.exec(l)?.[1])
      .filter((k): k is string => k !== undefined);
  }

  it('defaults to all-widgets when no scenario is given (unchanged behavior for existing callers)', async () => {
    const transport = new SimulatorTransport();
    const { lines } = collectLines(transport);
    await connectAndDrainHandshake(transport);
    expect(declaredKinds(lines).length).toBeGreaterThanOrEqual(18); // every registered kind
  });

  it('weather-station declares only line/value/gauge/led/log', async () => {
    const transport = new SimulatorTransport('weather-station');
    const { lines } = collectLines(transport);
    await connectAndDrainHandshake(transport);
    expect(new Set(declaredKinds(lines))).toEqual(
      new Set(['line', 'value', 'gauge', 'led', 'log']),
    );
  });

  it('motor-control declares only button/switch/slider, and the reject demo still works', async () => {
    const transport = new SimulatorTransport('motor-control');
    const { lines } = collectLines(transport);
    await connectAndDrainHandshake(transport);
    expect(new Set(declaredKinds(lines))).toEqual(new Set(['button', 'switch', 'slider']));

    await transport.write(
      new TextEncoder().encode('@{"t":"c","r":1,"id":"demo-switch","v":true}\n'),
    );
    await vi.advanceTimersByTimeAsync(200);
    lines.length = 0;
    await transport.write(
      new TextEncoder().encode('@{"t":"c","r":2,"id":"demo-button","v":true}\n'),
    );
    await vi.advanceTimersByTimeAsync(200);
    expect(lines.some((l) => l.includes('"r":2') && l.includes('"ok":false'))).toBe(true);
  });

  it('protocol-errors sends real weather-station-shaped data interleaved with malformed lines', async () => {
    const transport = new SimulatorTransport('protocol-errors');
    const { lines } = collectLines(transport);
    await connectAndDrainHandshake(transport);
    await vi.advanceTimersByTimeAsync(300 * 6); // several ticks

    expect(declaredKinds(lines).length).toBeGreaterThan(0);
    // At least one line must fail plain JSON.parse (the deliberately malformed ones aren't even
    // valid JSON.stringify output, unlike everything else this class ever emits).
    expect(lines.some((l) => l.startsWith('@') && !isValidJson(l.slice(1)))).toBe(true);
  });

  it('stress-test declares no widgets and streams roughly 1000 lines/s across a small channel pool', async () => {
    const transport = new SimulatorTransport('stress-test');
    const { lines } = collectLines(transport);
    await connectAndDrainHandshake(transport);
    await vi.advanceTimersByTimeAsync(1000);

    expect(declaredKinds(lines)).toHaveLength(0);
    const dataLines = lines.filter((l) => l.includes('"t":"d"'));
    expect(dataLines.length).toBeGreaterThanOrEqual(900); // ~1000/s, some tolerance
    expect(dataLines.length).toBeLessThanOrEqual(1100);
  });
});

function isValidJson(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}
