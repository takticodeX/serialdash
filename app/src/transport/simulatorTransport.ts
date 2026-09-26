import type { ConnectionState, Transport, TransportInfo } from './transport';
import { listWidgetDescriptors } from '../widgets/registry';

type DataListener = (chunk: Uint8Array) => void;
type StateListener = (state: ConnectionState) => void;
type DisconnectListener = (reason: 'user' | 'device' | 'error') => void;

const TICK_MS = 300;
const EVENT_EVERY_MS = 5000;
// A real device isn't instantaneous — a small artificial delay makes ack/pong latency in the
// status bar (§3.5 rule 5) show something other than "0 ms", and gives ackTimeoutMs (§5.8) a
// real deadline to race against when a test sets it below this. Also gives e2e assertions a
// realistic window to observe the "pending" state before it resolves (found via a genuinely
// flaky e2e run at 30ms: under parallel test load, the pending→idle transition could complete
// before Playwright's polling assertion sampled it even once).
const RESPONSE_DELAY_MS = 150;

interface IncomingMessage {
  t: string;
  r?: number;
  id?: string;
  v?: number | boolean | string;
}

/**
 * APP-SIM-01/02/03: a virtual device speaking protocol v1, implementing the same `Transport`
 * interface as `WebSerialTransport` — nothing above the transport layer (LineSplitter, Parser,
 * DeviceSession, widgets) can tell the difference (ADR-001).
 *
 * Declares every registered widget's demo example on connect (the "All widgets (P0)" scenario
 * from M2), then feeds each one's `generate()` on a fixed tick. Since M4, also answers what the
 * app writes back (`hi` requests, `ping`, `c`) — mirroring what a real device's library does
 * (LIB-RX-01..07, LIB-CTL-04): `ping` gets a `pong`; a control gets an `ack` plus, if accepted,
 * an echo `d` with the applied value (clamped to the control's own declared range, same as a
 * real device would). `demo-button`'s accept/reject logic mirrors §6.5's own worked example
 * (reject while "the motor" — here, `demo-switch` — is on) so the reject path in §3.6 rule 4 has
 * something real to exercise in e2e tests, without needing a separate selectable scenario.
 */
export class SimulatorTransport implements Transport {
  readonly info: TransportInfo = { label: 'Simulator' };
  private _state: ConnectionState = 'disconnected';
  private readonly dataListeners = new Set<DataListener>();
  private readonly stateListeners = new Set<StateListener>();
  private readonly disconnectListeners = new Set<DisconnectListener>();
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();
  private tickTimer: ReturnType<typeof setInterval> | undefined;
  private startTime = 0;
  private switchOn = false;

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

  private declareAll(): void {
    this.emitLine({ t: 'hi', v: 1, name: 'SerialDash Simulator', fw: '1.0.0', board: 'Simulator' });
    for (const descriptor of listWidgetDescriptors()) {
      this.emitLine(descriptor.demo.declaration);
    }
  }

  async connect(): Promise<void> {
    this.setState('connecting');
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.setState('connected');
    this.startTime = Date.now();
    this.switchOn = false;

    this.declareAll();

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

  /** Test-only hook (QA-03 e2e): simulates the device changing a control's state on its own
   * (SPEC.md §3.6 rule 6 — e.g. a physical button), deterministically instead of via a timer a
   * test would have to race. Exposed on `window` by `connectToSimulator` (SPEC.md §5.7), never
   * called by the app itself. */
  simulateExternalUpdate(id: string, value: number | boolean | string): void {
    if (id === 'demo-switch') this.switchOn = Boolean(value);
    this.emitLine({ t: 'd', d: { [id]: value } });
  }

  async write(data: Uint8Array): Promise<void> {
    const text = this.decoder.decode(data).trim();
    if (!text.startsWith('@{')) return; // free text from the console — nothing to react to

    let message: IncomingMessage;
    try {
      message = JSON.parse(text.slice(1)) as IncomingMessage;
    } catch {
      return; // malformed line — a real device's minimal parser would also just drop it
    }

    if (message.t === 'hi') {
      this.declareAll(); // PRT-20: hi from the app re-triggers a full redeclare
    } else if (message.t === 'ping' && message.r !== undefined) {
      const r = message.r;
      setTimeout(() => this.emitLine({ t: 'pong', r }), RESPONSE_DELAY_MS);
    } else if (message.t === 'c' && message.r !== undefined && message.id !== undefined) {
      this.handleControl(message.r, message.id, message.v);
    }
  }

  private handleControl(r: number, id: string, v: number | boolean | string | undefined): void {
    setTimeout(() => {
      const [ok, applied, err] = this.applyControl(id, v);
      this.emitLine(ok ? { t: 'ack', r, ok: true } : { t: 'ack', r, ok: false, err });
      if (ok) this.emitLine({ t: 'd', d: { [id]: applied } });
    }, RESPONSE_DELAY_MS);
  }

  /** The simulated "firmware" logic for each demo control — same shape a real `onControl`
   * callback has (SPEC.md §6.5): inspect/clamp the requested value, decide accept or reject,
   * return what was actually applied. */
  private applyControl(
    id: string,
    v: number | boolean | string | undefined,
  ): [ok: boolean, applied: number | boolean | string | undefined, err: string | undefined] {
    if (id === 'demo-switch') {
      this.switchOn = Boolean(v);
      return [true, this.switchOn, undefined];
    }
    if (id === 'demo-slider') {
      const declaration = listWidgetDescriptors().find((d) => d.kind === 'slider')?.demo
        .declaration as { min?: number; max?: number } | undefined;
      const min = declaration?.min ?? 0;
      const max = declaration?.max ?? 255;
      const clamped = Math.min(max, Math.max(min, Number(v)));
      return [true, clamped, undefined];
    }
    if (id === 'demo-button') {
      // Mirrors SPEC.md §6.5's own onControl example: reject while "the motor" is running.
      if (this.switchOn) return [false, undefined, 'Turn the switch off first'];
      return [true, true, undefined];
    }
    return [true, v, undefined];
  }

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
