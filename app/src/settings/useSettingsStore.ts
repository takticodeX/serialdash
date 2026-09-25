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
}

const DEFAULTS: PersistedSettings = {
  theme: 'auto',
  autoReconnect: true,
  consoleLineLimit: DEFAULT_CONSOLE_LINE_LIMIT,
  autoDiscovery: true,
};

interface SettingsStore extends PersistedSettings {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setTheme: (theme: Theme) => void;
  setAutoReconnect: (value: boolean) => void;
  setConsoleLineLimit: (value: number) => void;
  setAutoDiscovery: (value: boolean) => void;
  clearAllLocalData: () => Promise<void>;
}

function persisted(state: SettingsStore): PersistedSettings {
  const { theme, autoReconnect, consoleLineLimit, autoDiscovery } = state;
  return { theme, autoReconnect, consoleLineLimit, autoDiscovery };
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

  clearAllLocalData: async () => {
    await kvClearAll();
    set({ ...DEFAULTS });
  },
}));
