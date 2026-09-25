import { Suspense, useMemo, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import GridLayout, { WidthProvider, type Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { getWidgetDescriptor } from '../widgets/registry';
import { computeDefaultLayout, mergeLayout, type LayoutInput } from './layout';
import { useDashboardLayoutStore } from './useDashboardLayoutStore';
import type { DeviceSession, WidgetEntry } from '../session/DeviceSession';

const ResponsiveGridLayout = WidthProvider(GridLayout);
const ROW_HEIGHT = 32;

interface Props {
  deviceKey: string;
  group: string;
  widgets: [string, WidgetEntry][];
  session: DeviceSession;
}

/** APP-DSH-01: 12-column draggable/resizable grid for one group's widgets. */
export function Grid({ deviceKey, group, widgets, session }: Props): JSX.Element {
  const { t } = useTranslation();
  const savedLayout = useDashboardLayoutStore((s) => s.getGroupLayout(deviceKey, group));
  const setGroupLayout = useDashboardLayoutStore((s) => s.setGroupLayout);

  const layout = useMemo(() => {
    const items: LayoutInput[] = widgets.map(([id, entry], i) => ({
      id,
      declaration: entry.declaration,
      arrivalIndex: i,
    }));
    return savedLayout ? mergeLayout(items, savedLayout) : computeDefaultLayout(items);
  }, [widgets, savedLayout]);

  return (
    <ResponsiveGridLayout
      className="dashboard-grid"
      cols={12}
      rowHeight={ROW_HEIGHT}
      layout={layout}
      compactType="vertical"
      onLayoutChange={(next: Layout[]) => setGroupLayout(deviceKey, group, next)}
    >
      {widgets.map(([id, entry]) => {
        const descriptor = getWidgetDescriptor(entry.declaration.k);
        return (
          <div key={id} data-orphan={entry.orphan} style={{ opacity: entry.orphan ? 0.5 : 1 }}>
            {descriptor ? (
              // Suspense covers lazy-loaded widgets (currently just `gauge`, SPEC.md §2.2) —
              // a no-op boundary for every other widget, which resolves synchronously.
              <Suspense fallback={null}>
                <descriptor.Component
                  declaration={entry.declaration}
                  channelStore={session.channelStore}
                  session={session}
                />
              </Suspense>
            ) : (
              <div className="panel" style={{ padding: 8, height: '100%' }}>
                {t('dashboard.unsupportedWidget', { kind: entry.declaration.k })}
              </div>
            )}
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
}
