import { create } from 'zustand';
import type { Layout } from 'react-grid-layout';
import { kvGet, kvSet } from '../storage/db';

type GroupLayouts = Record<string, Layout[]>;
type StoredProfiles = Record<string, GroupLayouts>;

const STORAGE_KEY = 'dashboardProfiles';

interface DashboardLayoutStore {
  profiles: StoredProfiles;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  getGroupLayout: (deviceKey: string, group: string) => Layout[] | undefined;
  setGroupLayout: (deviceKey: string, group: string, layout: Layout[]) => void;
}

/** APP-DSH-03: dashboard layout persisted per device profile (see deviceKey.ts) and per group/tab
 * within that profile, restored automatically when the same device reconnects. */
export const useDashboardLayoutStore = create<DashboardLayoutStore>((set, get) => ({
  profiles: {},
  hydrated: false,

  hydrate: async () => {
    const stored = await kvGet<StoredProfiles>(STORAGE_KEY);
    set({ profiles: stored ?? {}, hydrated: true });
  },

  getGroupLayout: (deviceKey, group) => get().profiles[deviceKey]?.[group],

  setGroupLayout: (deviceKey, group, layout) => {
    set((state) => {
      const profiles = {
        ...state.profiles,
        [deviceKey]: { ...state.profiles[deviceKey], [group]: layout },
      };
      void kvSet(STORAGE_KEY, profiles);
      return { profiles };
    });
  },
}));
