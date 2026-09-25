import { create } from 'zustand';
import { kvClearAll, kvGet, kvSet } from '../storage/db';

export type Theme = 'light' | 'dark' | 'auto';

export const DEFAULT_CONSOLE_LINE_LIMIT = 20_000;

interface PersistedSettings {
  theme: Theme;
  autoReconnect: boolean;
  consoleLineLimit: number;
}

const DEFAULTS: PersistedSettings = {
  theme: 'auto',
  autoReconnect: true,
  consoleLineLimit: DEFAULT_CONSOLE_LINE_LIMIT,
};

interface SettingsStore extends PersistedSettings {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setTheme: (theme: Theme) => void;
  setAutoReconnect: (value: boolean) => void;
  setConsoleLineLimit: (value: number) => void;
  clearAllLocalData: () => Promise<void>;
}

async function persist(state: PersistedSettings): Promise<void> {
  await kvSet('settings', state);
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
    void persist({
      theme,
      autoReconnect: get().autoReconnect,
      consoleLineLimit: get().consoleLineLimit,
    });
  },

  setAutoReconnect: (autoReconnect) => {
    set({ autoReconnect });
    void persist({ theme: get().theme, autoReconnect, consoleLineLimit: get().consoleLineLimit });
  },

  setConsoleLineLimit: (consoleLineLimit) => {
    set({ consoleLineLimit });
    void persist({ theme: get().theme, autoReconnect: get().autoReconnect, consoleLineLimit });
  },

  clearAllLocalData: async () => {
    await kvClearAll();
    set({ ...DEFAULTS });
  },
}));
