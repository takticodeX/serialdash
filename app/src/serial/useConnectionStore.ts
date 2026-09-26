import { create } from 'zustand';
import type { ConnectionState, Transport, TransportInfo } from '../transport/transport';
import {
  DEFAULT_CONNECTION_OPTIONS,
  PortBusyError,
  WebSerialTransport,
  describePort,
  getAuthorizedPorts,
  isWebSerialSupported,
  requestNewPort,
  type SerialConnectionOptions,
} from './webSerialTransport';
import { SimulatorTransport } from '../transport/simulatorTransport';
import { onSerialPortConnected } from './hotplug';
import { LineSplitter } from '../protocol/LineSplitter';
import { parseLine } from '../protocol/Parser';
import { DeviceSession } from '../session/DeviceSession';
import { useConsoleStore } from '../console/useConsoleStore';
import { useSettingsStore } from '../settings/useSettingsStore';

export interface ThroughputStats {
  bytesPerSecond: number;
  linesPerSecond: number;
  /** Running total since connecting, not per-second — APP-CON-06's clickable error count. */
  protocolErrorCount: number;
}

const ZERO_THROUGHPUT: ThroughputStats = {
  bytesPerSecond: 0,
  linesPerSecond: 0,
  protocolErrorCount: 0,
};

interface ConnectionStore {
  transport: Transport | null;
  session: DeviceSession | null;
  /** Only set for a real Web Serial connection — null for the simulator. */
  port: SerialPort | null;
  state: ConnectionState;
  info: TransportInfo | null;
  options: SerialConnectionOptions;
  error: string | null;
  knownPorts: SerialPort[];
  throughput: ThroughputStats;

  setOptions: (partial: Partial<SerialConnectionOptions>) => void;
  refreshKnownPorts: () => Promise<void>;
  connectToNewPort: () => Promise<void>;
  connectToPort: (port: SerialPort) => Promise<void>;
  /** APP-SIM-03: "try without hardware", reachable from the connect screen and from the
   * unsupported-browser page (neither needs a real serial port). */
  connectToSimulator: () => Promise<void>;
  disconnect: () => Promise<void>;
}

let hotplugUnsubscribe: (() => void) | undefined;

/** Wires one connected session's data pipeline (SPEC.md §2.3 data flow):
 * Transport → LineSplitter → Parser →┬→ Console
 *                                     └→ DeviceSession → ChannelStore → Widgets
 * plus the byte/line/error throughput counters for the status bar (APP-CON-06). Works the same
 * for WebSerialTransport and SimulatorTransport — that's the point of the Transport interface
 * (ADR-001). */
function wireTransport(
  transport: Transport,
  session: DeviceSession,
  set: (partial: Partial<ConnectionStore>) => void,
): void {
  const splitter = new LineSplitter();
  let bytesThisSecond = 0;
  let linesThisSecond = 0;
  let protocolErrorCount = 0;

  transport.onData((chunk) => {
    bytesThisSecond += chunk.length;
    for (const split of splitter.push(chunk)) {
      linesThisSecond++;
      const parsed = parseLine(split);
      useConsoleStore.getState().addLine('rx', parsed);
      if (parsed.kind === 'message') {
        session.feed(parsed.message);
      } else if (parsed.kind === 'protocolError') {
        protocolErrorCount++;
      }
    }
  });

  const throughputInterval = setInterval(() => {
    set({
      throughput: {
        bytesPerSecond: bytesThisSecond,
        linesPerSecond: linesThisSecond,
        protocolErrorCount,
      },
    });
    bytesThisSecond = 0;
    linesThisSecond = 0;
  }, 1000);

  transport.onStateChange((state) => set({ state }));

  transport.onDisconnect(() => {
    clearInterval(throughputInterval);
    session.dispose();
    set({ state: 'disconnected', throughput: { ...ZERO_THROUGHPUT, protocolErrorCount } });
  });

  session.start();
}

export const useConnectionStore = create<ConnectionStore>((set, get) => {
  if (!hotplugUnsubscribe && isWebSerialSupported()) {
    hotplugUnsubscribe = onSerialPortConnected((port) => {
      const { port: currentPort, state } = get();
      if (!useSettingsStore.getState().autoReconnect) return;
      if (state !== 'disconnected') return;
      if (currentPort && port !== currentPort) return; // a different device reappeared
      if (currentPort) void get().connectToPort(currentPort);
    });
  }

  return {
    transport: null,
    session: null,
    port: null,
    state: 'disconnected',
    info: null,
    options: DEFAULT_CONNECTION_OPTIONS,
    error: null,
    knownPorts: [],
    throughput: ZERO_THROUGHPUT,

    setOptions: (partial) => set((s) => ({ options: { ...s.options, ...partial } })),

    refreshKnownPorts: async () => {
      const ports = await getAuthorizedPorts();
      set({ knownPorts: ports });
    },

    connectToNewPort: async () => {
      const port = await requestNewPort();
      await get().connectToPort(port);
    },

    connectToPort: async (port) => {
      set({ error: null, port, info: describePort(port), throughput: ZERO_THROUGHPUT });
      const transport = new WebSerialTransport(port, get().options);
      const session = new DeviceSession((line) => {
        void transport.write(new TextEncoder().encode(line + '\n'));
      });
      wireTransport(transport, session, set);
      set({ transport, session });
      try {
        await transport.connect();
      } catch (err) {
        session.dispose();
        set({
          state: 'disconnected',
          session: null,
          error:
            err instanceof PortBusyError
              ? 'portBusy'
              : err instanceof Error
                ? err.message
                : String(err),
        });
        throw err;
      }
    },

    connectToSimulator: async () => {
      set({ error: null, port: null, info: { label: 'Simulator' }, throughput: ZERO_THROUGHPUT });
      const transport = new SimulatorTransport();
      const session = new DeviceSession((line) => {
        void transport.write(new TextEncoder().encode(line + '\n'));
      });
      wireTransport(transport, session, set);
      set({ transport, session });
      // QA-03 e2e test hook only — the app itself never reads this. Harmless to expose
      // unconditionally: the simulator is already fake data, not a real device or user data.
      (
        window as typeof window & { __serialDashSimulator?: SimulatorTransport }
      ).__serialDashSimulator = transport;
      await transport.connect();
    },

    disconnect: async () => {
      await get().transport?.disconnect();
    },
  };
});
