import type { ConnectionState, Transport, TransportInfo } from './transport';
import { listWidgetDescriptors } from '../widgets/registry';

type DataListener = (chunk: Uint8Array) => void;
type StateListener = (state: ConnectionState) => void;
type DisconnectListener = (reason: 'user' | 'device' | 'error') => void;

const TICK_MS = 300;
const EVENT_EVERY_MS = 5000;

/**
 * APP-SIM-01/02/03: a virtual device speaking protocol v1, implementing the same `Transport`
 * interface as `WebSerialTransport` — nothing above the transport layer (LineSplitter, Parser,
 * DeviceSession, widgets) can tell the difference (ADR-001).
 *
 * The M2 "All widgets (P0)" scenario: declares every registered widget's demo example, then
 * feeds each one's `generate()` on a fixed tick — driven by wall-clock time since connecting, not
 * by the widgets themselves.
 */
export class SimulatorTransport implements Transport {
  readonly info: TransportInfo = { label: 'Simulator' };
  private _state: ConnectionState = 'disconnected';
  private readonly dataListeners = new Set<DataListener>();
  private readonly stateListeners = new Set<StateListener>();
  private readonly disconnectListeners = new Set<DisconnectListener>();
  private readonly encoder = new TextEncoder();
  private tickTimer: ReturnType<typeof setInterval> | undefined;
  private startTime = 0;

  get state(): ConnectionState {
    return this._state;
  }

  private setState(state: ConnectionState): void {
    this._state = state;
    for (const listener of this.stateListeners) listener(state);
  }

  private emitLine(payload: unknown): void {
    const line = `@${JSON.stringify(payload)}\n`;
    const bytes = this.encoder.encode(line);
    for (const listener of this.dataListeners) listener(bytes);
  }

  async connect(): Promise<void> {
    this.setState('connecting');
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.setState('connected');
    this.startTime = Date.now();

    this.emitLine({ t: 'hi', v: 1, name: 'SerialDash Simulator', fw: '1.0.0', board: 'Simulator' });
    for (const descriptor of listWidgetDescriptors()) {
      this.emitLine(descriptor.demo.declaration);
    }

    let lastEventAt = 0;
    this.tickTimer = setInterval(() => {
      const tickMs = Date.now() - this.startTime;

      const data: Record<string, unknown> = {};
      for (const descriptor of listWidgetDescriptors()) {
        Object.assign(data, descriptor.demo.generate(tickMs));
      }
      if (Object.keys(data).length > 0) this.emitLine({ t: 'd', d: data });

      if (tickMs - lastEventAt >= EVENT_EVERY_MS) {
        lastEventAt = tickMs;
        this.emitLine({ t: 'e', lvl: 'info', msg: 'Simulator heartbeat', src: 'sim' });
      }
    }, TICK_MS);
  }

  async disconnect(): Promise<void> {
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = undefined;
    this.setState('disconnected');
    for (const listener of this.disconnectListeners) listener('user');
  }

  // app→device writes (hi requests, future control commands) have nothing to act on yet: the
  // simulator already declares its handshake and widgets proactively on connect, and controls
  // aren't interactive until M4.
  async write(_data: Uint8Array): Promise<void> {}

  onData(listener: DataListener): () => void {
    this.dataListeners.add(listener);
    return () => this.dataListeners.delete(listener);
  }

  onStateChange(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  onDisconnect(listener: DisconnectListener): () => void {
    this.disconnectListeners.add(listener);
    return () => this.disconnectListeners.delete(listener);
  }
}
