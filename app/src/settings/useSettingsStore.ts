import { create } from 'zustand';
import { kvClearAll, kvGet, kvSet } from '../storage/db';

export type Theme = 'light' | 'dark' | 'auto';

export const DEFAULT_CONSOLE_LINE_LIMIT = 20_000;

interface PersistedSettings {
  theme: Theme;
  autoReconnect: boolean;
  consoleLineLimit: number;
  /** APP-DAT-03: whether an undeclared channel auto-creates a widget. */
  autoDiscovery: boolean;
  /** SPEC.md §3.6 rule 5 / §5.8: ms to wait for a control's `ack` before reverting it. */
  ackTimeoutMs: number;
  /** APP-DSH-09: disables drag/resize on the dashboard grid to prevent accidental changes. */
  lockLayout: boolean;
}

export const DEFAULT_ACK_TIMEOUT_MS = 1000;

const DEFAULTS: PersistedSettings = {
  theme: 'auto',
  autoReconnect: true,
  consoleLineLimit: DEFAULT_CONSOLE_LINE_LIMIT,
  autoDiscovery: true,
  ackTimeoutMs: DEFAULT_ACK_TIMEOUT_MS,
  lockLayout: false,
};

interface SettingsStore extends PersistedSettings {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setTheme: (theme: Theme) => void;
  setAutoReconnect: (value: boolean) => void;
  setConsoleLineLimit: (value: number) => void;
  setAutoDiscovery: (value: boolean) => void;
  setAckTimeoutMs: (value: number) => void;
  setLockLayout: (value: boolean) => void;
  clearAllLocalData: () => Promise<void>;
}

function persisted(state: SettingsStore): PersistedSettings {
  const { theme, autoReconnect, consoleLineLimit, autoDiscovery, ackTimeoutMs, lockLayout } = state;
  return { theme, autoReconnect, consoleLineLimit, autoDiscovery, ackTimeoutMs, lockLayout };
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,

  hydrate: async () => {
    const stored = await kvGet<PersistedSettings>('settings');
    set({ ...DEFAULTS, ...stored, hydrated: true });
  },

  setTheme: (theme) => {
    set({ theme });
    void kvSet('settings', persisted(get()));
  },

  setAutoReconnect: (autoReconnect) => {
    set({ autoReconnect });
    void kvSet('settings', persisted(get()));
  },

  setConsoleLineLimit: (consoleLineLimit) => {
    set({ consoleLineLimit });
    void kvSet('settings', persisted(get()));
  },

  setAutoDiscovery: (autoDiscovery) => {
    set({ autoDiscovery });
    void kvSet('settings', persisted(get()));
  },

  setAckTimeoutMs: (ackTimeoutMs) => {
    set({ ackTimeoutMs });
    void kvSet('settings', persisted(get()));
  },

  setLockLayout: (lockLayout) => {
    set({ lockLayout });
    void kvSet('settings', persisted(get()));
  },

  clearAllLocalData: async () => {
    await kvClearAll();
    set({ ...DEFAULTS });
  },
}));
