import type { Layout } from 'react-grid-layout';
import { useDashboardLayoutStore } from './useDashboardLayoutStore';
import { useWidgetOverridesStore, type ExportedProfile } from './useWidgetOverridesStore';

/** APP-DSH-08: the full `.serialdash.json` — layout (useDashboardLayoutStore) and
 * overrides/user-created widgets (useWidgetOverridesStore) combined, since both stores only ever
 * know about one device's slice at a time and the export is meant to be portable as one file. */
export interface DashboardProfileFile extends ExportedProfile {
  layouts: Record<string, Layout[]>;
}

export function exportDashboardProfile(deviceKey: string): DashboardProfileFile {
  const layouts = useDashboardLayoutStore.getState().profiles[deviceKey] ?? {};
  const { overrides, userWidgets } = useWidgetOverridesStore.getState().exportProfile(deviceKey);
  return { version: 1, layouts, overrides, userWidgets };
}

export function isDashboardProfileFile(data: unknown): data is DashboardProfileFile {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return d.version === 1 && typeof d.layouts === 'object' && typeof d.overrides === 'object';
}

export function importDashboardProfile(deviceKey: string, data: DashboardProfileFile): void {
  for (const [group, layout] of Object.entries(data.layouts)) {
    useDashboardLayoutStore.getState().setGroupLayout(deviceKey, group, layout);
  }
  useWidgetOverridesStore.getState().importProfile(deviceKey, {
    version: 1,
    overrides: data.overrides,
    userWidgets: data.userWidgets,
  });
}
