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
