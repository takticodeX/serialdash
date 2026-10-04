import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useChannelSeries } from '../../data/useChannelSeries';
import type { ChannelValue } from '../../data/ChannelStore';
import { ConfigField, WidgetCard, primaryChannel, useStale, widgetTitle } from '../common';
import { useWidgetStatsStore } from '../../dashboard/useWidgetStatsStore';
import type { WidgetComponentProps, WidgetConfigPanelProps, WidgetDemo } from '../registry';
import type { ValueWidget as ValueWidgetDeclaration } from '../../protocol/generated/index.js';

function formatValue(v: ChannelValue | undefined, dec: number | undefined): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'number') return dec !== undefined ? v.toFixed(dec) : String(v);
  if (typeof v === 'string' || typeof v === 'boolean') return String(v);
  return '—'; // pair/array/object — not a scalar this widget can render
}

function severityColor(
  v: ChannelValue | undefined,
  warn: [number, number] | undefined,
  alarm: [number, number] | undefined,
): string | undefined {
  if (typeof v !== 'number') return undefined;
  if (alarm && (v < alarm[0] || v > alarm[1])) return 'var(--color-danger)';
  if (warn && (v < warn[0] || v > warn[1])) return 'var(--color-warning)';
  return undefined;
}

export function ValueWidgetComponent({
  declaration,
  channelStore,
}: WidgetComponentProps<ValueWidgetDeclaration>): JSX.Element {
  const { t } = useTranslation();
  const channel = primaryChannel(declaration.ch) ?? declaration.id;
  const series = useChannelSeries(channelStore, channel);
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  const stale = useStale(latest?.t, declaration.stale);
  const color = severityColor(latest?.v, declaration.warn, declaration.alarm);
  const statsResetAt = useWidgetStatsStore((s) => s.resetAt[declaration.id] ?? 0);

  const trend =
    declaration.trend && typeof latest?.v === 'number' && typeof previous?.v === 'number'
      ? latest.v > previous.v
        ? '▲'
        : latest.v < previous.v
          ? '▼'
          : '·'
      : undefined;

  // APP-DSH-07 "azzera statistiche" resets the window these are computed over (statsResetAt),
  // not the underlying channel data other widgets on the same channel may still need.
  let sessionMin: number | undefined;
  let sessionMax: number | undefined;
  if (declaration.minmax) {
    for (const point of series) {
      if (point.t < statsResetAt || typeof point.v !== 'number') continue;
      if (sessionMin === undefined || point.v < sessionMin) sessionMin = point.v;
      if (sessionMax === undefined || point.v > sessionMax) sessionMax = point.v;
    }
  }

  return (
    <WidgetCard title={widgetTitle(declaration)} stale={stale} staleLabel={t('widgets.stale')}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: '1.8em', fontWeight: 700, color }}>
            {formatValue(latest?.v, declaration.dec)}
          </span>
          {declaration.unit && (
            <span style={{ color: 'var(--color-text-muted)' }}>{declaration.unit}</span>
          )}
          {trend && <span aria-hidden="true">{trend}</span>}
        </div>
        {declaration.minmax && sessionMin !== undefined && sessionMax !== undefined && (
          <div style={{ fontSize: '0.75em', color: 'var(--color-text-muted)' }}>
            {t('widgets.value.minmax', {
              min: formatValue(sessionMin, declaration.dec),
              max: formatValue(sessionMax, declaration.dec),
            })}
          </div>
        )}
      </div>
    </WidgetCard>
  );
}

export function ValueWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<ValueWidgetDeclaration>): JSX.Element {
  return (
    <div>
      <ConfigField label="Title" kind="value">
        <input
          type="text"
          value={declaration.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </ConfigField>
      <ConfigField label="Unit" kind="value">
        <input
          type="text"
          value={declaration.unit ?? ''}
          onChange={(e) => onChange({ unit: e.target.value })}
        />
      </ConfigField>
    </div>
  );
}

export const valueWidgetDemo: WidgetDemo<ValueWidgetDeclaration> = {
  declaration: {
    t: 'w',
    id: 'demo-value',
    k: 'value',
    title: 'Mode',
    ch: 'demo-value',
    trend: true,
  },
  generate: (tickMs) => ({ 'demo-value': Math.round(20 + 5 * Math.sin(tickMs / 2000) * 10) / 10 }),
};
