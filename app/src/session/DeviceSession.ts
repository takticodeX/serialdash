import { encodeHiRequest } from '../protocol/Encoder';
import type {
  DeviceHiMessage,
  DeviceToAppMessage,
  EventMessage,
  RemoveMessage,
  UpdateMessage,
  WidgetDeclaration,
} from '../protocol/generated/index.js';
import type { ChannelValue } from '../data/ChannelStore';
import { ChannelStore } from '../data/ChannelStore';
import { useSettingsStore } from '../settings/useSettingsStore';

export type HandshakeStatus = 'searching' | 'handshaked' | 'textMode';

export interface DeviceInfo {
  name: string;
  fw: string | undefined;
  board: string | undefined;
  rx: number | undefined;
  protocolVersion: number;
}

export interface WidgetEntry {
  declaration: WidgetDeclaration;
  /** PRT-22: true once 2s have passed after a `hi` without this widget being re-declared. */
  orphan: boolean;
}

const HANDSHAKE_RETRY_DELAYS_MS = [300, 1000, 3000]; // SPEC.md §3.5 rule 2
const TEXT_MODE_GRACE_MS = 1000; // grace period after the 3rd attempt before giving up (rule 3)
const ORPHAN_TIMEOUT_MS = 2000; // PRT-22

const AUTO_DISCOVERY_GROUP = 'Auto';
const MAX_EVENTS = 500; // matches the `log` widget's own default (SPEC.md §4.1)

type Listener = () => void;

function inferAutoWidgetKind(value: ChannelValue): 'line' | 'led' | 'value' | undefined {
  if (typeof value === 'number') return 'line';
  if (typeof value === 'boolean') return 'led';
  if (typeof value === 'string') return 'value';
  // Pair/array/object shapes map to xy/bar/table, which are P1 widgets that arrive in M5 — see
  // the M2 plan's flagged scope reduction. The channel still gets buffered in ChannelStore; it
  // just has no widget yet.
  return undefined;
}

/**
 * Owns the device-facing half of a connected session: the `hi` handshake (with retries and a
 * text-mode fallback), the live widget-declaration map (with PRT-22 orphan tracking), the event
 * log, and auto-discovery (APP-DAT-03) — routing `d` messages into the `ChannelStore` it owns.
 *
 * A plain class with a subscribe/notify pattern, mirroring `WebSerialTransport` — wired to React
 * by a zustand store created alongside the connection (see `useDeviceSessionStore`), not a
 * zustand store itself, since most of its work (handshake timers, per-message routing) has
 * nothing to do with React.
 */
export class DeviceSession {
  readonly channelStore: ChannelStore;

  private status: HandshakeStatus = 'searching';
  private deviceInfo: DeviceInfo | undefined;
  private readonly widgets = new Map<string, WidgetEntry>();
  private readonly pendingReconstruction = new Set<string>();
  private readonly events: EventMessage[] = [];
  private readonly resetMarkers: number[] = [];

  private handshakeTimers: ReturnType<typeof setTimeout>[] = [];
  private orphanTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly listeners = new Set<Listener>();

  constructor(private readonly write: (line: string) => void) {
    this.channelStore = new ChannelStore();
  }

  start(): void {
    this.scheduleHandshakeAttempts();
  }

  dispose(): void {
    this.clearHandshakeTimers();
    if (this.orphanTimer) clearTimeout(this.orphanTimer);
  }

  private clearHandshakeTimers(): void {
    for (const timer of this.handshakeTimers) clearTimeout(timer);
    this.handshakeTimers = [];
  }

  private scheduleHandshakeAttempts(): void {
    this.clearHandshakeTimers();
    const sendHi = (): void => {
      if (this.status === 'handshaked') return;
      this.write(encodeHiRequest());
    };
    for (const delay of HANDSHAKE_RETRY_DELAYS_MS) {
      this.handshakeTimers.push(setTimeout(sendHi, delay));
    }
    const lastAttempt = HANDSHAKE_RETRY_DELAYS_MS[HANDSHAKE_RETRY_DELAYS_MS.length - 1] ?? 0;
    this.handshakeTimers.push(
      setTimeout(() => {
        if (this.status === 'searching') {
          this.status = 'textMode';
          this.notify();
        }
      }, lastAttempt + TEXT_MODE_GRACE_MS),
    );
  }

  feed(message: DeviceToAppMessage): void {
    switch (message.t) {
      case 'hi':
        this.handleHi(message);
        break;
      case 'w':
        this.handleWidget(message);
        break;
      case 'u':
        this.handleUpdate(message);
        break;
      case 'x':
        this.handleRemove(message);
        break;
      case 'd':
        this.channelStore.ingest(message.d, message.ts);
        for (const [channelId, value] of Object.entries(message.d)) {
          this.maybeAutoDiscover(channelId, value);
        }
        this.notify();
        break;
      case 'e':
        this.events.push(message);
        if (this.events.length > MAX_EVENTS) this.events.shift();
        this.notify();
        break;
      case 'ack':
      case 'pong':
        // M4 (controls, ping/appConnected) — not handled yet.
        break;
    }
  }

  private handleHi(message: DeviceHiMessage): void {
    const wasHandshaked = this.status === 'handshaked';
    this.clearHandshakeTimers();
    this.status = 'handshaked';
    this.deviceInfo = {
      name: message.name,
      fw: message.fw,
      board: message.board,
      rx: message.rx,
      protocolVersion: message.v,
    };

    if (wasHandshaked) this.resetMarkers.push(Date.now()); // SPEC.md §3.5 rule 4: board reset

    // PRT-22: every currently-known widget is "pending reconstruction" until re-declared or 2s
    // pass, whichever comes first.
    this.pendingReconstruction.clear();
    for (const id of this.widgets.keys()) this.pendingReconstruction.add(id);
    if (this.orphanTimer) clearTimeout(this.orphanTimer);
    this.orphanTimer = setTimeout(() => {
      for (const id of this.pendingReconstruction) {
        const entry = this.widgets.get(id);
        if (entry) entry.orphan = true;
      }
      this.pendingReconstruction.clear();
      this.notify();
    }, ORPHAN_TIMEOUT_MS);

    this.notify();
  }

  private handleWidget(declaration: WidgetDeclaration): void {
    this.widgets.set(declaration.id, { declaration, orphan: false });
    this.pendingReconstruction.delete(declaration.id);
    this.notify();
  }

  private handleUpdate(message: UpdateMessage): void {
    const entry = this.widgets.get(message.id);
    if (!entry) return; // SPEC.md §3.3 `u`: ignored (debug-only) if the widget doesn't exist
    const { t: _t, id: _id, ...patch } = message;
    entry.declaration = { ...entry.declaration, ...patch } as WidgetDeclaration;
    this.notify();
  }

  private handleRemove(message: RemoveMessage): void {
    if (message.id) this.widgets.delete(message.id);
    else this.widgets.clear();
    this.notify();
  }

  private isChannelReferenced(channelId: string): boolean {
    for (const entry of this.widgets.values()) {
      const ch = entry.declaration.ch;
      if (!ch) continue;
      if (Array.isArray(ch) ? ch.includes(channelId) : ch === channelId) return true;
    }
    return false;
  }

  private maybeAutoDiscover(channelId: string, value: ChannelValue): void {
    if (!useSettingsStore.getState().autoDiscovery) return;
    if (this.widgets.has(channelId) || this.isChannelReferenced(channelId)) return;
    const kind = inferAutoWidgetKind(value);
    if (!kind) return;
    const declaration = {
      t: 'w',
      id: channelId,
      k: kind,
      ch: channelId,
      grp: AUTO_DISCOVERY_GROUP,
    } as WidgetDeclaration;
    this.widgets.set(channelId, { declaration, orphan: false });
  }

  getStatus(): HandshakeStatus {
    return this.status;
  }

  getDeviceInfo(): DeviceInfo | undefined {
    return this.deviceInfo;
  }

  getWidgets(): ReadonlyMap<string, WidgetEntry> {
    return this.widgets;
  }

  getEvents(): readonly EventMessage[] {
    return this.events;
  }

  getResetMarkers(): readonly number[] {
    return this.resetMarkers;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }
}
