import { create } from 'zustand';
import type { ConnectionState, TransportInfo } from '../transport/transport';
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
import { onSerialPortConnected } from './hotplug';
import { ByteLineSplitter } from '../console/byteLineSplitter';
import { useConsoleStore } from '../console/useConsoleStore';
import { useSettingsStore } from '../settings/useSettingsStore';

interface ConnectionStore {
  transport: WebSerialTransport | null;
  port: SerialPort | null;
  state: ConnectionState;
  info: TransportInfo | null;
  options: SerialConnectionOptions;
  error: string | null;
  knownPorts: SerialPort[];

  setOptions: (partial: Partial<SerialConnectionOptions>) => void;
  refreshKnownPorts: () => Promise<void>;
  connectToNewPort: () => Promise<void>;
  connectToPort: (port: SerialPort) => Promise<void>;
  disconnect: () => Promise<void>;
}

let rxSplitter = new ByteLineSplitter();
let hotplugUnsubscribe: (() => void) | undefined;

function wireTransport(
  transport: WebSerialTransport,
  set: (partial: Partial<ConnectionStore>) => void,
): void {
  rxSplitter = new ByteLineSplitter();

  transport.onData((chunk) => {
    for (const line of rxSplitter.push(chunk)) {
      useConsoleStore.getState().addLine('rx', line);
    }
  });

  transport.onStateChange((state) => set({ state }));

  transport.onDisconnect((reason) => {
    set({ state: 'disconnected' });
    if (reason === 'device' && useSettingsStore.getState().autoReconnect) {
      // The 'connect' hotplug listener (below) picks it back up once the OS re-enumerates it.
    }
  });
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
    port: null,
    state: 'disconnected',
    info: null,
    options: DEFAULT_CONNECTION_OPTIONS,
    error: null,
    knownPorts: [],

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
      set({ error: null, port, info: describePort(port) });
      const transport = new WebSerialTransport(port, get().options);
      wireTransport(transport, set);
      set({ transport });
      try {
        await transport.connect();
      } catch (err) {
        set({
          state: 'disconnected',
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

    disconnect: async () => {
      await get().transport?.disconnect();
    },
  };
});
