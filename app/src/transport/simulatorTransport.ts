import type { ConnectionState, Transport, TransportInfo } from './transport';
import { listWidgetDescriptors, type WidgetDescriptor } from '../widgets/registry';
import type { WidgetDeclaration } from '../protocol/generated/index.js';

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

/** APP-SIM-02: the 5 selectable simulator scenarios. `all-widgets` is the original M2/M4 default
 * (every registered widget's own demo example) and stays the default here too, so every existing
 * caller (e2e tests, `connectToSimulator()` with no argument) keeps behaving exactly as before. */
export type SimulatorScenario =
  'all-widgets' | 'weather-station' | 'motor-control' | 'protocol-errors' | 'stress-test';

// `weather-station`/`motor-control` don't get their own hand-written demo data — they reuse the
// exact same per-widget `demo.declaration`/`demo.generate()` every widget already ships with
// (SPEC.md §4, DOC-01), just filtered to a themed subset of kinds, so they can't drift from what
// "all-widgets" already demonstrates for each of those widgets individually.
const WEATHER_KINDS = new Set(['line', 'value', 'gauge', 'led', 'log']);
const MOTOR_KINDS = new Set(['button', 'switch', 'slider']);

function descriptorsForScenario(
  scenario: SimulatorScenario,
): WidgetDescriptor<WidgetDeclaration>[] {
  switch (scenario) {
    case 'weather-station':
      return listWidgetDescriptors().filter((d) => WEATHER_KINDS.has(d.kind));
    case 'motor-control':
      return listWidgetDescriptors().filter((d) => MOTOR_KINDS.has(d.kind));
    // protocol-errors reuses the weather-station subset for its "everything is actually fine"
    // lines, interleaved with deliberately broken ones (see tickProtocolErrors) — stress-test
    // declares nothing at all and leans entirely on auto-discovery (see startStressTest).
    case 'protocol-errors':
      return listWidgetDescriptors().filter((d) => WEATHER_KINDS.has(d.kind));
    case 'stress-test':
      return [];
    case 'all-widgets':
    default:
      return listWidgetDescriptors();
  }
}

// A handful of genuinely malformed/invalid lines for the `protocol-errors` scenario — sent as raw
// text (not through emitLine's JSON.stringify) so they can actually be broken, covering a spread
// of failure modes: syntactically invalid JSON, valid JSON missing a required field, an invalid
// identifier (PRT-11), and free text a real device's minimal parser would also just drop.
const PROTOCOL_ERROR_SAMPLES = [
  '{"t":"d","d":{"temp":}}',
  '{"t":"d"}',
  '{"t":"w","id":"not a valid id!","k":"line"}',
  'garbled non-json output from a bad sketch',
];

/**
 * APP-SIM-01/02/03: a virtual device speaking protocol v1, implementing the same `Transport`
 * interface as `WebSerialTransport` — nothing above the transport layer (LineSplitter, Parser,
 * DeviceSession, widgets) can tell the difference (ADR-001).
 *
 * Declares the widgets its scenario calls for on connect, then feeds each one's `generate()` on a
 * fixed tick. Since M4, also answers what the app writes back (`hi` requests, `ping`, `c`) —
 * mirroring what a real device's library does (LIB-RX-01..07, LIB-CTL-04): `ping` gets a `pong`;
 * a control gets an `ack` plus, if accepted, an echo `d` with the applied value (clamped to the
 * control's own declared range, same as a real device would). `demo-button`'s accept/reject logic
 * mirrors §6.5's own worked example (reject while "the motor" — here, `demo-switch` — is on), so
 * both `all-widgets` and `motor-control` get a real reject to exercise §3.6 rule 4 with.
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
  private errorTickCount = 0;

  constructor(private readonly scenario: SimulatorScenario = 'all-widgets') {}

  get state(): ConnectionState {
    return this._state;
  }

  private setState(state: ConnectionState): void {
    this._state = state;
    for (const listener of this.stateListeners) listener(state);
  }

  private emitLine(payload: unknown): void {
    this.emitRawLine(JSON.stringify(payload));
  }

  /** A line that looks like an attempted (possibly broken) SerialDash protocol line — `@`-
   * prefixed, same as every real line this class emits. Not for plain device text: see
   * `emitBytes` for that. */
  private emitRawLine(text: string): void {
    this.emitBytes(`@${text}`);
  }

  private emitBytes(text: string): void {
    const bytes = this.encoder.encode(`${text}\n`);
    for (const listener of this.dataListeners) listener(bytes);
  }

  private declareAll(): void {
    this.emitLine({ t: 'hi', v: 1, name: 'SerialDash Simulator', fw: '1.0.0', board: 'Simulator' });
    for (const descriptor of descriptorsForScenario(this.scenario)) {
      this.emitLine(descriptor.demo.declaration);
    }
  }

  async connect(): Promise<void> {
    this.setState('connecting');
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.setState('connected');
    this.startTime = Date.now();
    this.switchOn = false;

    if (this.scenario === 'stress-test') {
      this.startStressTest();
      return;
    }

    this.declareAll();

    let lastEventAt = 0;
    this.tickTimer = setInterval(() => {
      const tickMs = Date.now() - this.startTime;

      if (this.scenario === 'protocol-errors') {
        this.tickProtocolErrors(tickMs);
        return;
      }

      const data: Record<string, unknown> = {};
      for (const descriptor of descriptorsForScenario(this.scenario)) {
        Object.assign(data, descriptor.demo.generate(tickMs));
      }
      if (Object.keys(data).length > 0) this.emitLine({ t: 'd', d: data });

      if (tickMs - lastEventAt >= EVENT_EVERY_MS) {
        lastEventAt = tickMs;
        this.emitLine({ t: 'e', lvl: 'info', msg: 'Simulator heartbeat', src: 'sim' });
      }
    }, TICK_MS);
  }

  /** Every 3rd tick sends one of `PROTOCOL_ERROR_SAMPLES` instead of real data, so the console's
   * protocol-error handling (dimmed/red lines, the status bar's error counter) has something
   * genuine to show — the other 2 ticks send real weather-station-shaped data so there's still a
   * dashboard behind the noise. */
  private tickProtocolErrors(tickMs: number): void {
    this.errorTickCount++;
    if (this.errorTickCount % 3 === 0) {
      const sample = PROTOCOL_ERROR_SAMPLES[this.errorTickCount % PROTOCOL_ERROR_SAMPLES.length]!;
      this.emitRawLine(sample);
      return;
    }
    const data: Record<string, unknown> = {};
    for (const descriptor of descriptorsForScenario('protocol-errors')) {
      Object.assign(data, descriptor.demo.generate(tickMs));
    }
    if (Object.keys(data).length > 0) this.emitLine({ t: 'd', d: data });
  }

  // APP-SIM-02 "1000 righe/s": no widgets declared at all — every channel here is undeclared on
  // purpose, so what's actually on screen comes entirely from auto-discovery (APP-DAT-03) reacting
  // to real throughput, rather than a fixed dashboard built ahead of time. 50 ticks/s x 20 lines =
  // ~1000 separate `d` lines/s, spread across a small pool of channels.
  private readonly stressChannelCount = 10;
  private startStressTest(): void {
    const STRESS_TICK_MS = 20;
    const LINES_PER_TICK = 20;
    this.emitLine({ t: 'hi', v: 1, name: 'SerialDash Simulator', fw: '1.0.0', board: 'Simulator' });
    this.tickTimer = setInterval(() => {
      const tickMs = Date.now() - this.startTime;
      for (let i = 0; i < LINES_PER_TICK; i++) {
        const channel = `s${(tickMs + i) % this.stressChannelCount}`;
        const value = Math.round(Math.sin(tickMs / 500 + i) * 1000) / 10;
        this.emitLine({ t: 'd', d: { [channel]: value } });
      }
    }, STRESS_TICK_MS);
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

  /** Test-only hook (QA-03 e2e, APP-DAT-04): injects a raw incoming line exactly as given — no
   * `@` prefix added, unlike every real protocol line this class emits — for exercising Arduino
   * Serial Plotter–style plain text (`temp:23.4`) without adding a whole scenario just to send
   * one line on demand. Same exposure/never-called-by-the-app caveat as `simulateExternalUpdate`
   * above. */
  injectRawLine(text: string): void {
    this.emitBytes(text);
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
