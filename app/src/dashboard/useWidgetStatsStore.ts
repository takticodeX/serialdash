import { create } from 'zustand';

interface WidgetStatsStore {
  /** widgetId -> timestamp (ms) after which session stats (e.g. `value`'s min/max, APP-DSH-07's
   * "azzera statistiche") count. Deliberately not persisted — a "session" statistic is scoped to
   * the current connection, not saved across reloads. */
  resetAt: Record<string, number>;
  resetStats: (widgetId: string) => void;
}

export const useWidgetStatsStore = create<WidgetStatsStore>((set) => ({
  resetAt: {},
  resetStats: (widgetId) => set((s) => ({ resetAt: { ...s.resetAt, [widgetId]: Date.now() } })),
}));
