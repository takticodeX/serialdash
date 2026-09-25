import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeviceSession } from './DeviceSession';
import { useSettingsStore } from '../settings/useSettingsStore';
import type {
  DataMessage,
  DeviceHiMessage,
  EventMessage,
  LineWidget,
  RemoveMessage,
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
    expect(sent).toHaveLength(1); // no further retries after handshaking
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

  it('does not create a widget for pair/array/object shapes (xy/bar/table are P1, arrive in M5)', () => {
    const session = new DeviceSession(() => {});
    session.feed({ t: 'd', d: { pos: [1, 2], spectrum: [1, 2, 3], obj: { a: 1 } } } as DataMessage);
    expect(session.getWidgets().size).toBe(0);
    // the data is still buffered even without a widget:
    expect(session.channelStore.series('pos')).toHaveLength(1);
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
