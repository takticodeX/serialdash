import {
  createRequestIdSequence,
  encodeControl,
  encodeHiRequest,
  encodePing,
  type ControlValue,
} from '../protocol/Encoder';
import type {
  AckMessage,
  DeviceHiMessage,
  DeviceToAppMessage,
  EventMessage,
  PongMessage,
  RemoveMessage,
  UpdateMessage,
  WidgetDeclaration,
} from '../protocol/generated/index.js';
import type { ChannelValue } from '../data/ChannelStore';
import { ChannelStore } from '../data/ChannelStore';
import { useSettingsStore } from '../settings/useSettingsStore';

export type HandshakeStatus = 'searching' | 'handshaked' | 'textMode';

/** SPEC.md §3.6 states shown by a control widget. `pending`/`error` carry what the widget should
 * display in the meantime — the optimistic user-chosen value, or the rejection/timeout message. */
export type ControlUiState =
  | { status: 'idle' }
  | { status: 'pending'; value: ControlValue }
  | { status: 'error'; message: string };

interface PendingControl {
  r: number;
  value: ControlValue;
  maxValueBytes: number | undefined;
  timeoutTimer: ReturnType<typeof setTimeout>;
  /** §3.6 rule 7: a value that arrived while this one was still pending merges into it instead of
   * firing a second `c` — sent as soon as this request resolves (ack or timeout). */
  queued: { value: ControlValue; maxValueBytes: number | undefined } | undefined;
}

export interface LivenessInfo {
  /** Round-trip time of the most recent `ping`/`pong`, or undefined before the first one lands. */
  latencyMs: number | undefined;
  /** SPEC.md §3.5 rule 5: true after 3 consecutive `ping`s with no `pong`. */
  notResponding: boolean;
}

const PING_INTERVAL_MS = 2000; // SPEC.md §3.5 rule 5
const PONG_MISS_LIMIT = 3;
const CONTROL_ERROR_DISPLAY_MS = 3000; // SPEC.md §3.6 rule 4

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

function inferAutoWidgetKind(
  value: ChannelValue,
): 'line' | 'led' | 'value' | 'xy' | 'bar' | 'table' | undefined {
  if (typeof value === 'number') return 'line';
  if (typeof value === 'boolean') return 'led';
  if (typeof value === 'string') return 'value';
  if (value === null) return undefined; // no shape to infer a widget from yet
  if (Array.isArray(value)) {
    // A bare 2-number array is genuinely ambiguous — schema-valid as both an `[x,y]` pair and a
    // 2-element spectrum (APP-DAT-03's own `channels` schema is `anyOf`, not `oneOf`, precisely
    // because which one it means depends on the consuming widget, not the JSON shape). A device
    // that cares about the distinction declares the widget itself (PRT-32 auto-discovery only
    // ever applies to *undeclared* channels); for a guess with no other signal, 2 elements reads
    // as a coordinate pair more often than a 2-bin spectrum.
    return value.length === 2 ? 'xy' : 'bar';
  }
  return 'table'; // plain object (label -> number/string)
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

  private readonly requestIds = createRequestIdSequence();
  private pingTimer: ReturnType<typeof setInterval> | undefined;
  private pingInFlightR: number | undefined;
  private pingSentAt = 0;
  private missedPongs = 0;
  private latencyMs: number | undefined;

  private readonly pendingControls = new Map<string, PendingControl>();
  private readonly requestIdToControlId = new Map<number, string>();
  private readonly controlErrors = new Map<string, string>();
  private readonly controlErrorTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private readonly write: (line: string) => void) {
    this.channelStore = new ChannelStore();
  }

  start(): void {
    this.scheduleHandshakeAttempts();
  }

  dispose(): void {
    this.clearHandshakeTimers();
    if (this.orphanTimer) clearTimeout(this.orphanTimer);
    if (this.pingTimer) clearInterval(this.pingTimer);
    for (const pending of this.pendingControls.values()) clearTimeout(pending.timeoutTimer);
    this.pendingControls.clear();
    for (const timer of this.controlErrorTimers.values()) clearTimeout(timer);
    this.controlErrorTimers.clear();
  }

  private startPingLoop(): void {
    if (this.pingTimer) return; // already running (e.g. a second `hi` after a board reset)
    this.missedPongs = 0;
    this.pingTimer = setInterval(() => {
      if (this.pingInFlightR !== undefined) this.missedPongs++; // previous ping never got a pong
      this.pingInFlightR = this.requestIds.next();
      this.pingSentAt = Date.now();
      this.write(encodePing(this.pingInFlightR));
      this.notify(); // notResponding may have just flipped
    }, PING_INTERVAL_MS);
  }

  private handlePong(message: PongMessage): void {
    if (message.r !== this.pingInFlightR) return; // stale/unexpected — ignore
    this.latencyMs = Date.now() - this.pingSentAt;
    this.pingInFlightR = undefined;
    this.missedPongs = 0;
    this.notify();
  }

  getLiveness(): LivenessInfo {
    return { latencyMs: this.latencyMs, notResponding: this.missedPongs >= PONG_MISS_LIMIT };
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
        this.handleAck(message);
        break;
      case 'pong':
        this.handlePong(message);
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
    this.startPingLoop();

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
    // SPEC.md §3.6 rule 1: a control's `val` is its confirmed state, shown on the channel that
    // shares its id (PRT-13) until a `d` on that same channel supersedes it. Cast rather than
    // narrow the WidgetDeclaration union: every member's trailing `[k: string]: unknown` index
    // signature defeats `in`-based narrowing here, but the schema guarantees `val` (when present)
    // is always a plain ControlValue.
    const val = (declaration as { val?: ControlValue }).val;
    if (val !== undefined) {
      this.channelStore.ingest({ [declaration.id]: val }, undefined);
    }
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

  /**
   * Sends a control command (SPEC.md §3.6 rules 2/7). If `id` already has a request in flight,
   * the new value replaces whatever was queued and is sent once that request resolves (merge) —
   * so a widget can call this on every drag-move without flooding the wire or racing itself.
   */
  sendControl(id: string, value: ControlValue, maxValueBytes?: number): void {
    const existing = this.pendingControls.get(id);
    if (existing) {
      existing.queued = { value, maxValueBytes };
      this.notify(); // lets the widget show the newer optimistic value immediately
      return;
    }
    this.dispatchControl(id, value, maxValueBytes);
  }

  private dispatchControl(
    id: string,
    value: ControlValue,
    maxValueBytes: number | undefined,
  ): void {
    const r = this.requestIds.next();
    const ackTimeoutMs = useSettingsStore.getState().ackTimeoutMs;
    const timeoutTimer = setTimeout(() => {
      this.resolveControl(id, false, 'timeout');
    }, ackTimeoutMs);
    this.pendingControls.set(id, { r, value, maxValueBytes, timeoutTimer, queued: undefined });
    this.requestIdToControlId.set(r, id);
    this.write(encodeControl(r, id, value, maxValueBytes));
    this.notify();
  }

  private handleAck(message: AckMessage): void {
    const id = this.requestIdToControlId.get(message.r);
    if (id === undefined) return; // stale (already timed out) or not ours
    this.resolveControl(id, message.ok, message.err);
  }

  /** Ends the in-flight request for `id` (SPEC.md §3.6 rules 3-5): clears its pending/timeout
   * state, shows an error for `err`/`'timeout'` for 3s (rule 4/5), then dispatches whatever value
   * was merged in while it was pending, if any (rule 7). */
  private resolveControl(id: string, ok: boolean, err: string | undefined): void {
    const pending = this.pendingControls.get(id);
    if (!pending) return; // already resolved (e.g. timeout fired just after the ack arrived)
    clearTimeout(pending.timeoutTimer);
    this.pendingControls.delete(id);
    this.requestIdToControlId.delete(pending.r);

    if (!ok) {
      const existingTimer = this.controlErrorTimers.get(id);
      if (existingTimer) clearTimeout(existingTimer);
      this.controlErrors.set(id, err ?? 'rejected');
      this.controlErrorTimers.set(
        id,
        setTimeout(() => {
          this.controlErrors.delete(id);
          this.controlErrorTimers.delete(id);
          this.notify();
        }, CONTROL_ERROR_DISPLAY_MS),
      );
    }

    if (pending.queued) {
      this.dispatchControl(id, pending.queued.value, pending.queued.maxValueBytes);
    } else {
      this.notify();
    }
  }

  /** What a control widget for `id` should currently show (SPEC.md §3.6). `idle` means: read the
   * confirmed value from `channelStore` instead (this class doesn't duplicate it here). */
  getControlState(id: string): ControlUiState {
    const error = this.controlErrors.get(id);
    if (error !== undefined) return { status: 'error', message: error };
    const pending = this.pendingControls.get(id);
    if (pending) return { status: 'pending', value: pending.queued?.value ?? pending.value };
    return { status: 'idle' };
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
