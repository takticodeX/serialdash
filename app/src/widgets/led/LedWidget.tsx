import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useChannelSeries } from '../../data/useChannelSeries';
import type { ChannelValue } from '../../data/ChannelStore';
import { ConfigField, WidgetCard, primaryChannel, useStale, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps, WidgetDemo } from '../registry';
import type { LedWidget as LedWidgetDeclaration } from '../../protocol/generated/index.js';

function resolve(
  value: ChannelValue | undefined,
  declaration: LedWidgetDeclaration,
): { label: string | undefined; color: string } {
  if (declaration.states) {
    const entry = declaration.states[String(value)];
    if (entry) return { label: entry[0], color: entry[1] };
    return { label: undefined, color: '#888888' };
  }
  const on = declaration.on ?? '#2ecc71';
  const off = declaration.off ?? '#888888';
  return { label: undefined, color: value ? on : off };
}

export function LedWidgetComponent({
  declaration,
  channelStore,
}: WidgetComponentProps<LedWidgetDeclaration>): JSX.Element {
  const { t } = useTranslation();
  const channel = primaryChannel(declaration.ch) ?? declaration.id;
  const series = useChannelSeries(channelStore, channel);
  const latest = series[series.length - 1];
  const stale = useStale(latest?.t, declaration.stale);
  const { label, color } = resolve(latest?.v, declaration);

  return (
    <WidgetCard title={widgetTitle(declaration)} stale={stale} staleLabel={t('widgets.stale')}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: '100%' }}>
        <span
          aria-hidden="true"
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 8px ${color}`,
            flexShrink: 0,
          }}
        />
        <span>{label}</span>
      </div>
    </WidgetCard>
  );
}

export function LedWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<LedWidgetDeclaration>): JSX.Element {
  return (
    <div>
      <ConfigField label="Title" kind="led">
        <input
          type="text"
          value={declaration.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </ConfigField>
    </div>
  );
}

export const ledWidgetDemo: WidgetDemo<LedWidgetDeclaration> = {
  declaration: { t: 'w', id: 'demo-led', k: 'led', title: 'Fan', ch: 'demo-led' },
  generate: (tickMs) => ({ 'demo-led': Math.floor(tickMs / 1500) % 2 === 0 }),
};
