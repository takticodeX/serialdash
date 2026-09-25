import { create } from 'zustand';
import { kvGet, kvSet } from '../storage/db';

export type PanelOrientation = 'side' | 'below';

interface PersistedLayout {
  orientation: PanelOrientation;
  sizePx: number;
  collapsed: boolean;
}

const DEFAULTS: PersistedLayout = { orientation: 'below', sizePx: 320, collapsed: false };

interface PanelLayoutStore extends PersistedLayout {
  hydrate: () => Promise<void>;
  setOrientation: (o: PanelOrientation) => void;
  setSizePx: (px: number) => void;
  toggleCollapsed: () => void;
}

async function persist(state: PersistedLayout): Promise<void> {
  await kvSet('consolePanelLayout', state);
}

/** APP-CSL-10: resizable, collapsible console panel, docked beside or below the dashboard — the
 * user's choice, persisted. The dashboard itself arrives in M2; the panel behavior is real now. */
export const usePanelLayoutStore = create<PanelLayoutStore>((set, get) => ({
  ...DEFAULTS,

  hydrate: async () => {
    const stored = await kvGet<PersistedLayout>('consolePanelLayout');
    if (stored) set(stored);
  },

  setOrientation: (orientation) => {
    set({ orientation });
    void persist({ orientation, sizePx: get().sizePx, collapsed: get().collapsed });
  },

  setSizePx: (sizePx) => {
    set({ sizePx });
    void persist({ orientation: get().orientation, sizePx, collapsed: get().collapsed });
  },

  toggleCollapsed: () => {
    const collapsed = !get().collapsed;
    set({ collapsed });
    void persist({ orientation: get().orientation, sizePx: get().sizePx, collapsed });
  },
}));
