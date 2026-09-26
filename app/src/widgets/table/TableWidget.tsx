import { useEffect, useRef, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useChannelSeries } from '../../data/useChannelSeries';
import type { ChannelValue } from '../../data/ChannelStore';
import { WidgetCard, useStale, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps, WidgetDemo } from '../registry';
import type { TableWidget as TableWidgetDeclaration } from '../../protocol/generated/index.js';

const HIGHLIGHT_MS = 500; // SPEC.md §4.1 `table`: highlight changed values for 500ms

interface Row {
  key: string;
  value: ChannelValue;
}

function rowsFromValue(channels: string[], value: ChannelValue | undefined): Row[] {
  if (channels.length > 1) return channels.map((ch) => ({ key: ch, value: null }));
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value as Record<string, ChannelValue>).map(([key, v]) => ({
      key,
      value: v,
    }));
  }
  return channels.length === 1 ? [{ key: channels[0] ?? '', value: value ?? null }] : [];
}

export function TableWidgetComponent({
  declaration,
  channelStore,
}: WidgetComponentProps<TableWidgetDeclaration>): JSX.Element {
  const { t } = useTranslation();
  const channels = !declaration.ch
    ? []
    : Array.isArray(declaration.ch)
      ? declaration.ch
      : [declaration.ch];
  const primary = channels[0] ?? declaration.id;
  const series = useChannelSeries(channelStore, primary);
  const latest = series[series.length - 1];
  const stale = useStale(latest?.t, declaration.stale);
  const rows = rowsFromValue(channels, latest?.v);

  const previousValues = useRef<Record<string, ChannelValue>>({});
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());

  useEffect(() => {
    const changed = new Set<string>();
    for (const row of rows) {
      if (previousValues.current[row.key] !== row.value) changed.add(row.key);
      previousValues.current[row.key] = row.value;
    }
    if (changed.size === 0) return;
    setHighlighted(changed);
    const timer = setTimeout(() => setHighlighted(new Set()), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [rows]);

  const [keyHeader, valueHeader] = declaration.cols ?? [
    t('widgets.table.key'),
    t('widgets.table.value'),
  ];

  return (
    <WidgetCard title={widgetTitle(declaration)} stale={stale} staleLabel={t('widgets.stale')}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85em' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>{keyHeader}</th>
            <th style={{ textAlign: 'right' }}>{valueHeader}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              style={{
                background: highlighted.has(row.key) ? 'var(--color-accent)' : undefined,
                transition: 'background 200ms',
              }}
            >
              <td>{row.key}</td>
              <td style={{ textAlign: 'right' }}>{String(row.value ?? '—')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </WidgetCard>
  );
}

export function TableWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<TableWidgetDeclaration>): JSX.Element {
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

export const tableWidgetDemo: WidgetDemo<TableWidgetDeclaration> = {
  declaration: { t: 'w', id: 'demo-table', k: 'table', title: 'Status', ch: 'demo-table' },
  generate: (tickMs) => ({
    'demo-table': {
      Pump: Math.round(50 + 30 * Math.sin(tickMs / 2000)),
      Lights: Math.round(20 + 10 * Math.cos(tickMs / 1800)),
    },
  }),
};
