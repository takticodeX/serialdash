import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useChannelSeries } from '../../data/useChannelSeries';
import type { ChannelValue } from '../../data/ChannelStore';
import { WidgetCard, primaryChannel, useStale, widgetTitle } from '../common';
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

  const trend =
    declaration.trend && typeof latest?.v === 'number' && typeof previous?.v === 'number'
      ? latest.v > previous.v
        ? '▲'
        : latest.v < previous.v
          ? '▼'
          : '·'
      : undefined;

  return (
    <WidgetCard title={widgetTitle(declaration)} stale={stale} staleLabel={t('widgets.stale')}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, height: '100%' }}>
        <span style={{ fontSize: '1.8em', fontWeight: 700, color }}>
          {formatValue(latest?.v, declaration.dec)}
        </span>
        {declaration.unit && (
          <span style={{ color: 'var(--color-text-muted)' }}>{declaration.unit}</span>
        )}
        {trend && <span aria-hidden="true">{trend}</span>}
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
      <label>
        Title
        <input
          type="text"
          value={declaration.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </label>
      <label>
        Unit
        <input
          type="text"
          value={declaration.unit ?? ''}
          onChange={(e) => onChange({ unit: e.target.value })}
        />
      </label>
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
