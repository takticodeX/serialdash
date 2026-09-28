import type { DataMessage } from '../protocol/generated/index.js';

/** A channel value's possible shapes (SPEC.md §3.3 `d`) — reuses the type the schema already
 * generates for `DataMessage.d` rather than redeclaring it. `null` represents a missing value /
 * gap (PRT-09: the device sends `null` for NaN/Infinity, since JSON has neither). */
export type ChannelValue = DataMessage['d'][string];

export interface ChannelPoint {
  /** Local ms epoch, resolved per PRT-30/31 — never the raw device `ts`. */
  t: number;
  v: ChannelValue;
}

export const DEFAULT_CHANNEL_CAPACITY = 20_000;

type Listener = () => void;

class Channel {
  private buffer: ChannelPoint[] = [];
  private readonly listeners = new Set<Listener>();

  constructor(private readonly capacity: number) {}

  push(point: ChannelPoint): void {
    this.buffer.push(point);
    if (this.buffer.length > this.capacity)
      this.buffer.splice(0, this.buffer.length - this.capacity);
    for (const listener of this.listeners) listener();
  }

  series(): readonly ChannelPoint[] {
    return this.buffer;
  }

  latest(): ChannelPoint | undefined {
    return this.buffer[this.buffer.length - 1];
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  get size(): number {
    return this.buffer.length;
  }
}

/**
 * APP-DAT-01: one ring buffer per channel, bounded to `capacity` points (default 20000) so
 * memory never grows without limit (APP-NFR-03).
 *
 * Timestamp resolution (PRT-30/31): without a device `ts`, the arrival instant is used. With
 * `ts`, the offset between the device's clock (`millis()`) and the local clock is established at
 * the first `ts` seen and reused after that — except a backward jump (board reset, or `millis()`
 * wrapping after ~49 days) recalculates the offset from scratch rather than corrupting existing
 * points with a now-wrong offset.
 */
export class ChannelStore {
  private readonly channels = new Map<string, Channel>();
  private deviceClockOffsetMs: number | undefined;
  private lastDeviceTs: number | undefined;

  constructor(private readonly capacity: number = DEFAULT_CHANNEL_CAPACITY) {}

  private getOrCreateChannel(id: string): Channel {
    let channel = this.channels.get(id);
    if (!channel) {
      channel = new Channel(this.capacity);
      this.channels.set(id, channel);
    }
    return channel;
  }

  private resolveTimestamp(deviceTs: number | undefined): number {
    if (deviceTs === undefined) return Date.now(); // PRT-30

    const isBackwardJump = this.lastDeviceTs !== undefined && deviceTs < this.lastDeviceTs;
    if (this.deviceClockOffsetMs === undefined || isBackwardJump) {
      this.deviceClockOffsetMs = Date.now() - deviceTs;
    }
    this.lastDeviceTs = deviceTs;
    return deviceTs + this.deviceClockOffsetMs;
  }

  /** Ingests one `d` message's channel map at a single resolved instant. */
  ingest(data: Record<string, ChannelValue>, deviceTs: number | undefined): void {
    const t = this.resolveTimestamp(deviceTs);
    for (const [channelId, value] of Object.entries(data)) {
      this.getOrCreateChannel(channelId).push({ t, v: value });
    }
  }

  series(channelId: string): readonly ChannelPoint[] {
    return this.channels.get(channelId)?.series() ?? [];
  }

  latest(channelId: string): ChannelPoint | undefined {
    return this.channels.get(channelId)?.latest();
  }

  size(channelId: string): number {
    return this.channels.get(channelId)?.size ?? 0;
  }

  /** Subscribes to new points on one channel. Creates the channel if it doesn't exist yet, so a
   * widget can subscribe before any data has arrived for its channel. */
  subscribe(channelId: string, listener: Listener): () => void {
    return this.getOrCreateChannel(channelId).subscribe(listener);
  }

  channelIds(): string[] {
    return [...this.channels.keys()];
  }

  /** Called on a fresh `hi` handshake reset (SPEC.md §3.5 rule 4) — note the spec keeps chart
   * history across a device reset and just draws a marker; this is for a full local reset (e.g.
   * connecting to a different device), not the per-reset marker behavior. */
  reset(): void {
    this.channels.clear();
    this.deviceClockOffsetMs = undefined;
    this.lastDeviceTs = undefined;
  }
}

/** `channelIds()` includes ids that only exist because some widget subscribed to them (creating
 * an empty channel — see `subscribe`) — every control widget does this for its own id, whether or
 * not the device actually recognizes that control. Pickers that let a user choose "an existing
 * channel" (AddWidgetDialog, WidgetPanel) want real data, not these phantom entries. */
export function listNonEmptyChannelIds(store: ChannelStore): string[] {
  return store.channelIds().filter((id) => store.size(id) > 0);
}
