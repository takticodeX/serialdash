import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useChannelSeries } from '../../data/useChannelSeries';
import { WidgetCard, primaryChannel, useStale, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps, WidgetDemo } from '../registry';
import type { LevelWidget as LevelWidgetDeclaration } from '../../protocol/generated/index.js';

function zoneColorAt(
  value: number,
  zones: [number, number, string][] | undefined,
): string | undefined {
  if (!zones) return undefined;
  for (const [from, to, color] of zones) {
    if (value >= from && value <= to) return color;
  }
  return undefined;
}

/** SPEC.md §4.1 `level`: a fill bar, horizontal or vertical, with the same `[from,to,color]`
 * zones as `gauge` — plain CSS rather than ECharts, since a level bar has no need for canvas. */
export function LevelWidgetComponent({
  declaration,
  channelStore,
}: WidgetComponentProps<LevelWidgetDeclaration>): JSX.Element {
  const { t } = useTranslation();
  const channel = primaryChannel(declaration.ch) ?? declaration.id;
  const series = useChannelSeries(channelStore, channel);
  const latest = series[series.length - 1];
  const stale = useStale(latest?.t, declaration.stale);
  const min = declaration.min ?? 0;
  const max = declaration.max ?? 100;
  const value = typeof latest?.v === 'number' ? latest.v : min;
  const span = max - min || 1;
  const pct = Math.min(100, Math.max(0, ((value - min) / span) * 100));
  const color = zoneColorAt(value, declaration.zones) ?? 'var(--color-accent)';

  return (
    <WidgetCard title={widgetTitle(declaration)} stale={stale} staleLabel={t('widgets.stale')}>
      <div
        style={{
          display: 'flex',
          flexDirection: declaration.vert ? 'column' : 'row',
          alignItems: 'center',
          gap: 8,
          height: '100%',
        }}
      >
        <div
          style={{
            position: 'relative',
            background: 'var(--color-border)',
            borderRadius: 4,
            overflow: 'hidden',
            width: declaration.vert ? 24 : '100%',
            height: declaration.vert ? '100%' : 24,
            flex: declaration.vert ? '0 0 auto' : '1 1 auto',
          }}
        >
          <div
            style={{
              position: 'absolute',
              background: color,
              transition: 'all 200ms',
              ...(declaration.vert
                ? { bottom: 0, left: 0, right: 0, height: `${pct}%` }
                : { top: 0, bottom: 0, left: 0, width: `${pct}%` }),
            }}
          />
        </div>
        <span>
          {value}
          {declaration.unit ? ` ${declaration.unit}` : ''}
        </span>
      </div>
    </WidgetCard>
  );
}

export function LevelWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<LevelWidgetDeclaration>): JSX.Element {
  return (
    <div>
      <label>
        Title
        <input
          type="text"
          value={declaration.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </label>
    </div>
  );
}

export const levelWidgetDemo: WidgetDemo<LevelWidgetDeclaration> = {
  declaration: {
    t: 'w',
    id: 'demo-level',
    k: 'level',
    title: 'Tank',
    ch: 'demo-level',
    min: 0,
    max: 100,
    unit: '%',
  },
  generate: (tickMs) => ({ 'demo-level': Math.round(50 + 40 * Math.sin(tickMs / 4000)) }),
};
