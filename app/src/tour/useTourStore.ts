import { create } from 'zustand';
import { kvGet, kvSet } from '../storage/db';

/** DOC-32: max 4 steps. */
export const TOUR_STEP_COUNT = 4;

interface TourStore {
  hydrated: boolean;
  /** Whether the tour has ever been completed or skipped — persisted so it doesn't auto-start
   * again on a later visit. */
  seen: boolean;
  active: boolean;
  step: number;
  hydrate: () => Promise<void>;
  /** Opens the tour from the beginning — the Help menu's "replay tour" entry. */
  start: () => void;
  next: () => void;
  prev: () => void;
  /** Closes the tour (skip, or finishing the last step) and persists `seen`. */
  stop: () => void;
}

/** DOC-32: a first-run tour, auto-started once per browser profile (hydrate() below) and
 * reopenable any time from the Help menu. Persists only a `seen` flag — same `kv` store as
 * settings (`storage/db.ts`), under its own key so clearing settings doesn't silently replay the
 * tour on every reload between hydrate calls. */
export const useTourStore = create<TourStore>((set, get) => ({
  hydrated: false,
  seen: false,
  active: false,
  step: 0,

  hydrate: async () => {
    const seen = (await kvGet<boolean>('tourSeen')) ?? false;
    set({ seen, hydrated: true, active: !seen, step: 0 });
  },

  start: () => set({ active: true, step: 0 }),

  next: () => {
    const { step } = get();
    if (step + 1 >= TOUR_STEP_COUNT) get().stop();
    else set({ step: step + 1 });
  },

  prev: () => set({ step: Math.max(0, get().step - 1) }),

  stop: () => {
    set({ active: false, seen: true });
    void kvSet('tourSeen', true);
  },
}));
