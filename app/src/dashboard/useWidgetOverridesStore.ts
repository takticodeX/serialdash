import { create } from 'zustand';
import { kvGet, kvSet } from '../storage/db';
import type { WidgetDeclaration } from '../protocol/generated/index.js';

// Not `Partial<WidgetDeclaration>`: that union-of-many-kinds type distributes over Partial into a
// union of per-kind partials, so generic patch-merging code (building a patch from an arbitrary
// subset of fields, deleting one field to "reset" it) can't produce a value TS accepts as *any*
// specific member — a patch isn't a well-formed declaration until it's merged onto one anyway
// (see effectiveWidgets.ts, the one place that actually casts the merge result). `k`'s value is
// still always a valid WidgetDeclaration['k'] at runtime; this only loosens the static type.
type OverridePatch = Record<string, unknown>;
type DeviceOverrides = Record<string, OverridePatch>; // widgetId -> patch
type DeviceUserWidgets = Record<string, WidgetDeclaration>; // widgetId -> full declaration

interface StoredProfile {
  overrides: DeviceOverrides;
  userWidgets: DeviceUserWidgets;
}

type StoredProfiles = Record<string, StoredProfile>; // deviceKey -> profile

const STORAGE_KEY = 'widgetOverrides';
const EMPTY_PROFILE: StoredProfile = { overrides: {}, userWidgets: {} };

/** The subset of a device's dashboard customization this store owns — layout (x/y/w/h) lives
 * separately in `useDashboardLayoutStore`; together the two make up a `.serialdash.json` export
 * (APP-DSH-08). */
export interface ExportedProfile {
  version: 1;
  overrides: DeviceOverrides;
  userWidgets: DeviceUserWidgets;
}

interface WidgetOverridesStore {
  profiles: StoredProfiles;
  hydrated: boolean;
  hydrate: () => Promise<void>;

  /** APP-DSH-04: a patch applied on top of the device's own declaration — precedence is
   * override > device > the widget component's own built-in defaults. */
  getOverride: (deviceKey: string, widgetId: string) => OverridePatch | undefined;
  setOverride: (deviceKey: string, widgetId: string, patch: OverridePatch) => void;
  /** Reverts a single overridden property back to the device's value (§5.5's per-property
   * "Ripristina valore del dispositivo"). */
  resetOverrideField: (deviceKey: string, widgetId: string, field: string) => void;
  /** Reverts every overridden property on this widget at once. */
  clearOverride: (deviceKey: string, widgetId: string) => void;

  /** APP-DSH-06: widgets the user created from the UI, not declared by any device `w`. Stored as
   * a full declaration (not a patch — there's no device version underneath to merge with). */
  getUserWidgets: (deviceKey: string) => WidgetDeclaration[];
  addUserWidget: (deviceKey: string, declaration: WidgetDeclaration) => void;
  updateUserWidget: (deviceKey: string, widgetId: string, patch: OverridePatch) => void;
  removeUserWidget: (deviceKey: string, widgetId: string) => void;

  exportProfile: (deviceKey: string) => ExportedProfile;
  importProfile: (deviceKey: string, data: ExportedProfile) => void;
}

function persist(profiles: StoredProfiles): void {
  void kvSet(STORAGE_KEY, profiles);
}

function getProfile(profiles: StoredProfiles, deviceKey: string): StoredProfile {
  return profiles[deviceKey] ?? EMPTY_PROFILE;
}

export const useWidgetOverridesStore = create<WidgetOverridesStore>((set, get) => ({
  profiles: {},
  hydrated: false,

  hydrate: async () => {
    const stored = await kvGet<StoredProfiles>(STORAGE_KEY);
    set({ profiles: stored ?? {}, hydrated: true });
  },

  getOverride: (deviceKey, widgetId) => getProfile(get().profiles, deviceKey).overrides[widgetId],

  setOverride: (deviceKey, widgetId, patch) => {
    set((state) => {
      const profile = getProfile(state.profiles, deviceKey);
      const nextProfile: StoredProfile = {
        ...profile,
        overrides: {
          ...profile.overrides,
          [widgetId]: { ...profile.overrides[widgetId], ...patch },
        },
      };
      const profiles = { ...state.profiles, [deviceKey]: nextProfile };
      persist(profiles);
      return { profiles };
    });
  },

  resetOverrideField: (deviceKey, widgetId, field) => {
    set((state) => {
      const profile = getProfile(state.profiles, deviceKey);
      const existing = profile.overrides[widgetId];
      if (!existing) return state;
      const { [field]: _removed, ...rest } = existing as Record<string, unknown>;
      const overrides = { ...profile.overrides };
      if (Object.keys(rest).length > 0) overrides[widgetId] = rest as OverridePatch;
      else delete overrides[widgetId];
      const profiles = { ...state.profiles, [deviceKey]: { ...profile, overrides } };
      persist(profiles);
      return { profiles };
    });
  },

  clearOverride: (deviceKey, widgetId) => {
    set((state) => {
      const profile = getProfile(state.profiles, deviceKey);
      if (!(widgetId in profile.overrides)) return state;
      const overrides = { ...profile.overrides };
      delete overrides[widgetId];
      const profiles = { ...state.profiles, [deviceKey]: { ...profile, overrides } };
      persist(profiles);
      return { profiles };
    });
  },

  getUserWidgets: (deviceKey) => Object.values(getProfile(get().profiles, deviceKey).userWidgets),

  addUserWidget: (deviceKey, declaration) => {
    set((state) => {
      const profile = getProfile(state.profiles, deviceKey);
      const nextProfile: StoredProfile = {
        ...profile,
        userWidgets: { ...profile.userWidgets, [declaration.id]: declaration },
      };
      const profiles = { ...state.profiles, [deviceKey]: nextProfile };
      persist(profiles);
      return { profiles };
    });
  },

  updateUserWidget: (deviceKey, widgetId, patch) => {
    set((state) => {
      const profile = getProfile(state.profiles, deviceKey);
      const existing = profile.userWidgets[widgetId];
      if (!existing) return state;
      const userWidgets = {
        ...profile.userWidgets,
        [widgetId]: { ...existing, ...patch } as WidgetDeclaration,
      };
      const profiles = { ...state.profiles, [deviceKey]: { ...profile, userWidgets } };
      persist(profiles);
      return { profiles };
    });
  },

  removeUserWidget: (deviceKey, widgetId) => {
    set((state) => {
      const profile = getProfile(state.profiles, deviceKey);
      if (!(widgetId in profile.userWidgets)) return state;
      const userWidgets = { ...profile.userWidgets };
      delete userWidgets[widgetId];
      const profiles = { ...state.profiles, [deviceKey]: { ...profile, userWidgets } };
      persist(profiles);
      return { profiles };
    });
  },

  exportProfile: (deviceKey) => {
    const profile = getProfile(get().profiles, deviceKey);
    return { version: 1, overrides: profile.overrides, userWidgets: profile.userWidgets };
  },

  importProfile: (deviceKey, data) => {
    set((state) => {
      const profiles = {
        ...state.profiles,
        [deviceKey]: { overrides: data.overrides, userWidgets: data.userWidgets },
      };
      persist(profiles);
      return { profiles };
    });
  },
}));
