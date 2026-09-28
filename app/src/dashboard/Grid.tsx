import { Suspense, useMemo, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import GridLayout, { WidthProvider, type Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { getWidgetDescriptor } from '../widgets/registry';
import { computeDefaultLayout, mergeLayout, type LayoutInput } from './layout';
import { useDashboardLayoutStore } from './useDashboardLayoutStore';
import { useSettingsStore } from '../settings/useSettingsStore';
import { useWidgetStatsStore } from './useWidgetStatsStore';
import { widgetSeriesToCsv } from './exportWidgetCsv';
import { downloadTextFile } from '../ui/downloadTextFile';
import { WidgetPanel } from './WidgetPanel';
import type { EffectiveWidgetEntry } from './effectiveWidgets';
import type { DeviceSession } from '../session/DeviceSession';

const ResponsiveGridLayout = WidthProvider(GridLayout);
const ROW_HEIGHT = 32;

interface Props {
  deviceKey: string;
  group: string;
  widgets: [string, EffectiveWidgetEntry][];
  session: DeviceSession;
}

/** APP-DSH-01: 12-column draggable/resizable grid for one group's widgets. Since M5, also hosts
 * each widget's toolbar (settings, fullscreen, CSV export, reset stats — APP-DSH-04/07) and the
 * fullscreen overlay. */
export function Grid({ deviceKey, group, widgets, session }: Props): JSX.Element {
  const { t } = useTranslation();
  const savedLayout = useDashboardLayoutStore((s) => s.getGroupLayout(deviceKey, group));
  const setGroupLayout = useDashboardLayoutStore((s) => s.setGroupLayout);
  const lockLayout = useSettingsStore((s) => s.lockLayout);
  const resetStats = useWidgetStatsStore((s) => s.resetStats);
  const [configWidgetId, setConfigWidgetId] = useState<string | null>(null);
  const [fullscreenWidgetId, setFullscreenWidgetId] = useState<string | null>(null);

  const layout = useMemo(() => {
    const items: LayoutInput[] = widgets.map(([id, entry], i) => ({
      id,
      declaration: entry.declaration,
      arrivalIndex: i,
    }));
    return savedLayout ? mergeLayout(items, savedLayout) : computeDefaultLayout(items);
  }, [widgets, savedLayout]);

  const configEntry = configWidgetId ? widgets.find(([id]) => id === configWidgetId) : undefined;
  const fullscreenEntry = fullscreenWidgetId
    ? widgets.find(([id]) => id === fullscreenWidgetId)
    : undefined;

  const renderWidget = (id: string, entry: EffectiveWidgetEntry): JSX.Element => {
    const descriptor = getWidgetDescriptor(entry.declaration.k);
    if (!descriptor) {
      return (
        <div className="panel" style={{ padding: 8, height: '100%' }}>
          {t('dashboard.unsupportedWidget', { kind: entry.declaration.k })}
        </div>
      );
    }
    return (
      // Suspense covers lazy-loaded widgets (currently just `gauge`, SPEC.md §2.2) — a no-op
      // boundary for every other widget, which resolves synchronously.
      <Suspense fallback={null}>
        <descriptor.Component
          declaration={entry.declaration}
          channelStore={session.channelStore}
          session={session}
        />
      </Suspense>
    );
  };

  return (
    <>
      <ResponsiveGridLayout
        className="dashboard-grid"
        cols={12}
        rowHeight={ROW_HEIGHT}
        layout={layout}
        compactType="vertical"
        isDraggable={!lockLayout}
        isResizable={!lockLayout}
        // Without this, react-grid-layout's own mousedown/touchstart handling (drag-to-move)
        // races interactive elements for the same click — control widgets (button/switch/slider,
        // M4) would silently swallow real user clicks otherwise, since a grid item's whole area
        // is a drag handle by default. Found via e2e testing: Playwright's synthesized mouse
        // events reproduced it deterministically, but the same race exists for a real mouse
        // click too.
        draggableCancel="button, input, select, textarea, a"
        onLayoutChange={(next: Layout[]) => setGroupLayout(deviceKey, group, next)}
      >
        {widgets.map(([id, entry]) => (
          <div
            key={id}
            data-testid={`widget-${id}`}
            data-orphan={entry.orphan}
            style={{ opacity: entry.orphan ? 0.5 : 1, position: 'relative' }}
          >
            <div
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                zIndex: 2,
                display: 'flex',
                gap: 2,
              }}
            >
              <button
                type="button"
                title={t('dashboard.toolbar.settings')}
                aria-label={t('dashboard.toolbar.settings')}
                onClick={() => setConfigWidgetId(id)}
              >
                ⚙
              </button>
              <button
                type="button"
                title={t('dashboard.toolbar.fullscreen')}
                aria-label={t('dashboard.toolbar.fullscreen')}
                onClick={() => setFullscreenWidgetId(id)}
              >
                ⛶
              </button>
              <button
                type="button"
                title={t('dashboard.toolbar.exportCsv')}
                aria-label={t('dashboard.toolbar.exportCsv')}
                onClick={() =>
                  downloadTextFile(
                    `${id}.csv`,
                    widgetSeriesToCsv(session.channelStore, entry.declaration),
                    'text/csv;charset=utf-8',
                  )
                }
              >
                ⬇
              </button>
              {entry.declaration.k === 'value' && (
                <button
                  type="button"
                  title={t('dashboard.toolbar.resetStats')}
                  aria-label={t('dashboard.toolbar.resetStats')}
                  onClick={() => resetStats(id)}
                >
                  ↺
                </button>
              )}
            </div>
            {renderWidget(id, entry)}
          </div>
        ))}
      </ResponsiveGridLayout>

      {configEntry && (
        <WidgetPanel
          deviceKey={deviceKey}
          widgetId={configEntry[0]}
          entry={configEntry[1]}
          channelStore={session.channelStore}
          onClose={() => setConfigWidgetId(null)}
        />
      )}

      {fullscreenEntry && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 20,
            background: 'var(--color-bg)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <button
            type="button"
            onClick={() => setFullscreenWidgetId(null)}
            aria-label={t('dashboard.toolbar.exitFullscreen')}
            style={{ alignSelf: 'flex-end', marginBottom: 8 }}
          >
            {t('dashboard.toolbar.exitFullscreen')} ✕
          </button>
          <div style={{ flex: 1, minHeight: 0 }}>
            {renderWidget(fullscreenEntry[0], fullscreenEntry[1])}
          </div>
        </div>
      )}
    </>
  );
}
