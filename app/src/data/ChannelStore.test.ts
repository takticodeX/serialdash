import { describe, expect, it, vi } from 'vitest';
import { ChannelStore, listNonEmptyChannelIds } from './ChannelStore';

describe('APP-DAT-01 ChannelStore ring buffer', () => {
  it('appends points and exposes them in arrival order', () => {
    const store = new ChannelStore();
    store.ingest({ t1: 1 }, undefined);
    store.ingest({ t1: 2 }, undefined);
    store.ingest({ t1: 3 }, undefined);
    expect(store.series('t1').map((p) => p.v)).toEqual([1, 2, 3]);
  });

  it('bounds memory to the configured capacity, dropping the oldest points', () => {
    const store = new ChannelStore(3);
    for (let i = 0; i < 5; i++) store.ingest({ t1: i }, undefined);
    expect(store.series('t1').map((p) => p.v)).toEqual([2, 3, 4]);
    expect(store.size('t1')).toBe(3);
  });

  it('keeps separate ring buffers per channel', () => {
    const store = new ChannelStore();
    store.ingest({ a: 1, b: 'x' }, undefined);
    expect(store.series('a').map((p) => p.v)).toEqual([1]);
    expect(store.series('b').map((p) => p.v)).toEqual(['x']);
  });

  it('returns an empty series for an unknown channel rather than throwing', () => {
    const store = new ChannelStore();
    expect(store.series('nope')).toEqual([]);
    expect(store.latest('nope')).toBeUndefined();
  });

  it('treats null as a valid point value (PRT-09 missing-value gap)', () => {
    const store = new ChannelStore();
    store.ingest({ t1: null }, undefined);
    expect(store.latest('t1')?.v).toBeNull();
  });
});

describe('PRT-30/31 timestamp resolution', () => {
  it('uses the arrival instant when no device ts is given (PRT-30)', () => {
    const store = new ChannelStore();
    const before = Date.now();
    store.ingest({ t1: 1 }, undefined);
    const after = Date.now();
    const t = store.latest('t1')!.t;
    expect(t).toBeGreaterThanOrEqual(before);
    expect(t).toBeLessThanOrEqual(after);
  });

  it('establishes a device-clock offset at the first ts and reuses it (PRT-31)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
    const store = new ChannelStore();

    store.ingest({ t1: 1 }, 100); // offset = 1_000_000 - 100 = 999_900
    expect(store.latest('t1')!.t).toBe(1_000_000);

    vi.setSystemTime(1_000_500);
    store.ingest({ t1: 2 }, 600); // same offset: 600 + 999_900
    expect(store.latest('t1')!.t).toBe(1_000_500);

    vi.useRealTimers();
  });

  it('recalculates the offset on a backward jump (reset / millis() overflow, PRT-31)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
    const store = new ChannelStore();

    store.ingest({ t1: 1 }, 100_000); // offset A = 900_000

    vi.setSystemTime(1_000_100);
    store.ingest({ t1: 2 }, 50); // backward jump: ts (50) < lastDeviceTs (100_000) → recompute
    // new offset = 1_000_100 - 50 = 1_000_050, so resolved t = 50 + 1_000_050 = 1_000_100
    expect(store.latest('t1')!.t).toBe(1_000_100);

    vi.useRealTimers();
  });
});

describe('subscribe', () => {
  it('notifies listeners synchronously on each push', () => {
    const store = new ChannelStore();
    const seen: number[] = [];
    store.subscribe('t1', () => seen.push(store.latest('t1')!.v as number));
    store.ingest({ t1: 1 }, undefined);
    store.ingest({ t1: 2 }, undefined);
    expect(seen).toEqual([1, 2]);
  });

  it('stops notifying after unsubscribe', () => {
    const store = new ChannelStore();
    let calls = 0;
    const unsubscribe = store.subscribe('t1', () => calls++);
    store.ingest({ t1: 1 }, undefined);
    unsubscribe();
    store.ingest({ t1: 2 }, undefined);
    expect(calls).toBe(1);
  });

  it('creates the channel eagerly so a widget can subscribe before any data arrives', () => {
    const store = new ChannelStore();
    store.subscribe('not-yet', () => {});
    expect(store.channelIds()).toContain('not-yet');
  });
});

describe('listNonEmptyChannelIds', () => {
  it('excludes channels a widget merely subscribed to but that never received any data', () => {
    const store = new ChannelStore();
    store.ingest({ real: 1 }, undefined);
    store.subscribe('phantom', () => {}); // e.g. a broken control widget's own id
    expect(store.channelIds()).toEqual(expect.arrayContaining(['real', 'phantom']));
    expect(listNonEmptyChannelIds(store)).toEqual(['real']);
  });
});

describe('reset', () => {
  it('clears all channels and the clock offset', () => {
    const store = new ChannelStore();
    store.ingest({ t1: 1 }, 100);
    store.reset();
    expect(store.channelIds()).toEqual([]);
    expect(store.series('t1')).toEqual([]);
  });
});
