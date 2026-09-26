import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeviceSession } from './DeviceSession';
import { useSettingsStore } from '../settings/useSettingsStore';
import type {
  AckMessage,
  DataMessage,
  DeviceHiMessage,
  EventMessage,
  LineWidget,
  PongMessage,
  RemoveMessage,
  SliderWidget,
  SwitchWidget,
  UpdateMessage,
} from '../protocol/generated/index.js';

function hi(overrides: Partial<DeviceHiMessage> = {}): DeviceHiMessage {
  return { t: 'hi', v: 1, name: 'Serra', ...overrides };
}

describe('DeviceSession handshake (SPEC.md §3.5)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('sends hi at 300ms, 1000ms and 3000ms while nothing has been received', () => {
    const sent: string[] = [];
    const session = new DeviceSession((line) => sent.push(line));
    session.start();

    vi.advanceTimersByTime(299);
    expect(sent).toEqual([]);

    vi.advanceTimersByTime(2); // -> 301ms
    expect(sent).toEqual(['@{"t":"hi","v":1}']);

    vi.advanceTimersByTime(700); // -> 1001ms
    expect(sent).toHaveLength(2);

    vi.advanceTimersByTime(2000); // -> 3001ms
    expect(sent).toHaveLength(3);

    expect(session.getStatus()).toBe('searching');
  });

  it('falls back to text mode if no hi arrives after the third attempt', () => {
    const session = new DeviceSession(() => {});
    session.start();
    vi.advanceTimersByTime(3000 + 1000);
    expect(session.getStatus()).toBe('textMode');
  });

  it('stops retrying and reports handshaked once a hi is received', () => {
    const sent: string[] = [];
    const session = new DeviceSession((line) => sent.push(line));
    session.start();

    vi.advanceTimersByTime(300);
    expect(sent).toHaveLength(1);

    session.feed(hi());
    expect(session.getStatus()).toBe('handshaked');
    expect(session.getDeviceInfo()).toEqual({
      name: 'Serra',
      fw: undefined,
      board: undefined,
      rx: undefined,
      protocolVersion: 1,
    });

    vi.advanceTimersByTime(10_000);
    // No further `hi` retries after handshaking — but `ping` now flows every 2s once handshaked
    // (§3.5 rule 5), so `sent` itself grows; that's covered by the ping-loop tests below.
    const hiRequests = sent.filter((line) => line.includes('"t":"hi"'));
    expect(hiRequests).toHaveLength(1);
  });

  it('never enters text mode once handshaked', () => {
    const session = new DeviceSession(() => {});
    session.start();
    session.feed(hi());
    vi.advanceTimersByTime(10_000);
    expect(session.getStatus()).toBe('handshaked');
  });
});

describe('DeviceSession widget declarations', () => {
  it('adds a widget on w and exposes it as not orphaned', () => {
    const session = new DeviceSession(() => {});
    const decl: SwitchWidget = { t: 'w', id: 'fan', k: 'switch', title: 'Fan' };
    session.feed(decl);
    expect(session.getWidgets().get('fan')).toEqual({ declaration: decl, orphan: false });
  });

  it('merges u into an existing widget without touching t/id/k', () => {
    const session = new DeviceSession(() => {});
    session.feed({ t: 'w', id: 'g1', k: 'gauge', min: 0, max: 100 } as never);
    const update: UpdateMessage = { t: 'u', id: 'g1', max: 200, title: 'Renamed' };
    session.feed(update);
    const entry = session.getWidgets().get('g1');
    expect(entry?.declaration).toMatchObject({
      t: 'w',
      id: 'g1',
      k: 'gauge',
      min: 0,
      max: 200,
      title: 'Renamed',
    });
  });

  it('ignores u for a widget that does not exist', () => {
    const session = new DeviceSession(() => {});
    session.feed({ t: 'u', id: 'nope', max: 1 } as UpdateMessage);
    expect(session.getWidgets().size).toBe(0);
  });

  it('removes one widget by id, or all widgets when x has no id', () => {
    const session = new DeviceSession(() => {});
    session.feed({ t: 'w', id: 'a', k: 'led' } as never);
    session.feed({ t: 'w', id: 'b', k: 'led' } as never);

    session.feed({ t: 'x', id: 'a' } as RemoveMessage);
    expect([...session.getWidgets().keys()]).toEqual(['b']);

    session.feed({ t: 'x' } as RemoveMessage);
    expect(session.getWidgets().size).toBe(0);
  });
});

describe('PRT-22 orphan tracking', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('marks widgets not re-declared within 2s of a hi as orphaned, without removing them', () => {
    const session = new DeviceSession(() => {});
    session.feed({ t: 'w', id: 'kept', k: 'led' } as never);
    session.feed({ t: 'w', id: 'dropped', k: 'led' } as never);

    // A reset: a second hi restarts reconstruction for both.
    session.feed(hi());
    session.feed({ t: 'w', id: 'kept', k: 'led' } as never); // re-declared in time

    vi.advanceTimersByTime(2000);

    expect(session.getWidgets().get('kept')?.orphan).toBe(false);
    expect(session.getWidgets().get('dropped')?.orphan).toBe(true);
    expect(session.getWidgets().has('dropped')).toBe(true); // not removed, just orphaned
  });

  it('does not orphan a widget declared for the first time (no prior hi to reconstruct from)', () => {
    const session = new DeviceSession(() => {});
    session.feed(hi());
    session.feed({ t: 'w', id: 'fresh', k: 'led' } as never);
    vi.advanceTimersByTime(2000);
    expect(session.getWidgets().get('fresh')?.orphan).toBe(false);
  });

  it('records a reset marker on every hi after the first', () => {
    const session = new DeviceSession(() => {});
    session.feed(hi());
    expect(session.getResetMarkers()).toEqual([]);
    session.feed(hi());
    expect(session.getResetMarkers()).toHaveLength(1);
  });
});

describe('APP-DAT-03 auto-discovery', () => {
  afterEach(() => useSettingsStore.setState({ autoDiscovery: true }));

  it('creates a line widget for a numeric channel with no declared widget', () => {
    const session = new DeviceSession(() => {});
    session.feed({ t: 'd', d: { temp: 23.4 } } as DataMessage);
    const entry = session.getWidgets().get('temp');
    expect(entry?.declaration).toMatchObject({ k: 'line', ch: 'temp', grp: 'Auto' });
  });

  it('creates a led widget for a boolean channel and a value widget for a string channel', () => {
    const session = new DeviceSession(() => {});
    session.feed({ t: 'd', d: { fan: true, mode: 'auto' } } as DataMessage);
    expect(session.getWidgets().get('fan')?.declaration).toMatchObject({ k: 'led' });
    expect(session.getWidgets().get('mode')?.declaration).toMatchObject({ k: 'value' });
  });

  it('creates xy/bar/table widgets for pair/array/object channel shapes (P1, SPEC.md §4.1)', () => {
    const session = new DeviceSession(() => {});
    session.feed({ t: 'd', d: { pos: [1, 2], spectrum: [1, 2, 3], obj: { a: 1 } } } as DataMessage);
    expect(session.getWidgets().get('pos')?.declaration).toMatchObject({ k: 'xy', ch: 'pos' });
    expect(session.getWidgets().get('spectrum')?.declaration).toMatchObject({ k: 'bar' });
    expect(session.getWidgets().get('obj')?.declaration).toMatchObject({ k: 'table' });
  });

  it('treats null as not-yet-shaped and creates no widget for it', () => {
    const session = new DeviceSession(() => {});
    session.feed({ t: 'd', d: { unknown: null } } as DataMessage);
    expect(session.getWidgets().size).toBe(0);
    expect(session.channelStore.series('unknown')).toHaveLength(1); // still buffered
  });

  it('does not auto-discover a channel already referenced by a declared widget', () => {
    const session = new DeviceSession(() => {});
    const line: LineWidget = { t: 'w', id: 'chart', k: 'line', ch: 'temp' };
    session.feed(line);
    session.feed({ t: 'd', d: { temp: 23.4 } } as DataMessage);
    expect(session.getWidgets().size).toBe(1);
    expect(session.getWidgets().has('temp')).toBe(false);
  });

  it('is skipped entirely when disabled in settings', () => {
    useSettingsStore.setState({ autoDiscovery: false });
    const session = new DeviceSession(() => {});
    session.feed({ t: 'd', d: { temp: 23.4 } } as DataMessage);
    expect(session.getWidgets().size).toBe(0);
    expect(session.channelStore.series('temp')).toHaveLength(1); // data still flows
  });
});

describe('event log', () => {
  it('accumulates events and bounds them to the last 500', () => {
    const session = new DeviceSession(() => {});
    for (let i = 0; i < 510; i++) {
      session.feed({ t: 'e', msg: `event ${i}` } as EventMessage);
    }
    expect(session.getEvents()).toHaveLength(500);
    expect(session.getEvents()[0]?.msg).toBe('event 10');
    expect(session.getEvents()[499]?.msg).toBe('event 509');
  });
});

describe('subscribe', () => {
  it('notifies listeners when state changes', () => {
    const session = new DeviceSession(() => {});
    let calls = 0;
    session.subscribe(() => calls++);
    session.feed(hi());
    session.feed({ t: 'w', id: 'x', k: 'led' } as never);
    expect(calls).toBeGreaterThanOrEqual(2);
  });
});

describe('ping/pong liveness (SPEC.md §3.5 rule 5)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('sends a ping every 2s once handshaked, not before', () => {
    const sent: string[] = [];
    const session = new DeviceSession((line) => sent.push(line));
    session.start();
    vi.advanceTimersByTime(5000);
    expect(sent.filter((l) => l.includes('"t":"ping"'))).toHaveLength(0);

    session.feed(hi());
    vi.advanceTimersByTime(1999);
    expect(sent.filter((l) => l.includes('"t":"ping"'))).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(sent.filter((l) => l.includes('"t":"ping"'))).toHaveLength(1);
    vi.advanceTimersByTime(4000);
    expect(sent.filter((l) => l.includes('"t":"ping"'))).toHaveLength(3);
  });

  it('computes latency from the ping/pong round trip', () => {
    const requestIds: number[] = [];
    const session = new DeviceSession((line) => {
      const match = /"t":"ping","r":(\d+)/.exec(line);
      if (match?.[1]) requestIds.push(Number(match[1]));
    });
    session.start();
    session.feed(hi());
    expect(session.getLiveness()).toEqual({ latencyMs: undefined, notResponding: false });

    vi.advanceTimersByTime(2000);
    vi.advanceTimersByTime(37);
    session.feed({ t: 'pong', r: requestIds[0] } as PongMessage);
    expect(session.getLiveness().latencyMs).toBe(37);
    expect(session.getLiveness().notResponding).toBe(false);
  });

  it('reports notResponding after 3 consecutive missed pongs, and clears it on the next pong', () => {
    const requestIds: number[] = [];
    const session = new DeviceSession((line) => {
      const match = /"t":"ping","r":(\d+)/.exec(line);
      if (match?.[1]) requestIds.push(Number(match[1]));
    });
    session.start();
    session.feed(hi());

    // 4 ping intervals with no pong at all: the 1st ping's non-answer is only detected when the
    // 2nd fires, so 3 *misses* need the 4th tick.
    vi.advanceTimersByTime(2000 * 4);
    expect(session.getLiveness().notResponding).toBe(true);

    session.feed({ t: 'pong', r: requestIds[requestIds.length - 1] } as PongMessage);
    expect(session.getLiveness().notResponding).toBe(false);
  });

  it('ignores a pong whose r does not match the in-flight ping', () => {
    const session = new DeviceSession(() => {});
    session.start();
    session.feed(hi());
    vi.advanceTimersByTime(2000);
    session.feed({ t: 'pong', r: 999_999 } as PongMessage);
    expect(session.getLiveness().latencyMs).toBeUndefined();
  });
});

describe('controls (SPEC.md §3.6)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function requestIdOf(line: string): number {
    const match = /"t":"c","r":(\d+)/.exec(line);
    if (!match?.[1]) throw new Error(`not a control line: ${line}`);
    return Number(match[1]);
  }

  it('sends c immediately when idle and reports the optimistic value as pending', () => {
    const sent: string[] = [];
    const session = new DeviceSession((line) => sent.push(line));
    session.sendControl('fan', true);
    expect(sent).toEqual(['@{"t":"c","r":1,"id":"fan","v":true}']);
    expect(session.getControlState('fan')).toEqual({ status: 'pending', value: true });
  });

  it('ack ok:true clears pending back to idle', () => {
    const sent: string[] = [];
    const session = new DeviceSession((line) => sent.push(line));
    session.sendControl('fan', true);
    const r = requestIdOf(sent[0] as string);
    session.feed({ t: 'ack', r, ok: true } as AckMessage);
    expect(session.getControlState('fan')).toEqual({ status: 'idle' });
  });

  it('ack ok:false shows the error for 3s then reverts to idle', () => {
    const sent: string[] = [];
    const session = new DeviceSession((line) => sent.push(line));
    session.sendControl('pwm', 255);
    const r = requestIdOf(sent[0] as string);
    session.feed({ t: 'ack', r, ok: false, err: 'Valore fuori range' } as AckMessage);
    expect(session.getControlState('pwm')).toEqual({
      status: 'error',
      message: 'Valore fuori range',
    });

    vi.advanceTimersByTime(2999);
    expect(session.getControlState('pwm').status).toBe('error');
    vi.advanceTimersByTime(1);
    expect(session.getControlState('pwm')).toEqual({ status: 'idle' });
  });

  it('behaves like a rejection when no ack arrives within the configured timeout', () => {
    const session = new DeviceSession(() => {});
    session.sendControl('fan', true);
    vi.advanceTimersByTime(useSettingsStore.getState().ackTimeoutMs);
    expect(session.getControlState('fan').status).toBe('error');
  });

  it('merges a second sendControl while one is pending instead of sending a new c immediately', () => {
    const sent: string[] = [];
    const session = new DeviceSession((line) => sent.push(line));
    session.sendControl('pwm', 100);
    session.sendControl('pwm', 150); // dragged further before the first ack came back
    expect(sent).toHaveLength(1); // still just the first request on the wire
    expect(session.getControlState('pwm')).toEqual({ status: 'pending', value: 150 });

    const r = requestIdOf(sent[0] as string);
    session.feed({ t: 'ack', r, ok: true } as AckMessage);
    expect(sent).toHaveLength(2); // the merged value is sent once the first resolves
    expect(sent[1]).toBe(`@{"t":"c","r":${requestIdOf(sent[1] as string)},"id":"pwm","v":150}`);
  });

  it('ignores an ack whose r does not match anything pending', () => {
    const session = new DeviceSession(() => {});
    session.sendControl('fan', true);
    session.feed({ t: 'ack', r: 999_999, ok: true } as AckMessage);
    expect(session.getControlState('fan').status).toBe('pending'); // untouched
  });

  it("seeds a control's confirmed value from the widget declaration's val (rule 1)", () => {
    const session = new DeviceSession(() => {});
    const decl: SliderWidget = { t: 'w', id: 'pwm', k: 'slider', min: 0, max: 255, val: 128 };
    session.feed(decl);
    expect(session.channelStore.series('pwm')).toEqual([{ t: expect.any(Number), v: 128 }]);
  });
});
