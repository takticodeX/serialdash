import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useChannelSeries } from '../../data/useChannelSeries';
import type { ChannelValue } from '../../data/ChannelStore';
import { WidgetCard, useStale, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps, WidgetDemo } from '../registry';
import type { BarWidget as BarWidgetDeclaration } from '../../protocol/generated/index.js';

interface Bar {
  label: string;
  value: number;
}

/** SPEC.md §4.1 `bar` accepts three value shapes on the *same* channel(s): one number per
 * channel (multi-`ch`), a label->number object (pie-like), or a flat array (spectrum). This
 * normalizes whichever one shows up into a common list of {label, value} bars. */
function barsFromChannels(
  channels: string[],
  latestByChannel: (ChannelValue | undefined)[],
  xlabels: string[] | undefined,
): Bar[] {
  if (channels.length > 1) {
    return channels.map((ch, i) => ({ label: ch, value: Number(latestByChannel[i]) || 0 }));
  }
  const value = latestByChannel[0];
  if (Array.isArray(value)) {
    return value.map((v, i) => ({
      label: xlabels?.[i] ?? String(i),
      value: typeof v === 'number' ? v : 0,
    }));
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value as Record<string, number>).map(([label, v]) => ({
      label,
      value: v,
    }));
  }
  return channels.length === 1 ? [{ label: channels[0] ?? '', value: Number(value) || 0 }] : [];
}

// Not a hook (doesn't call useState/useEffect/etc.) despite reading reactive-looking data — one
// useChannelSeries per channel would violate the rules of hooks (variable call count). Bar
// widgets binding to several channels is uncommon; re-rendering on the *first* channel's updates
// (see the real useChannelSeries call in the component below) and reading the rest as plain
// snapshots at render time is a reasonable approximation rather than building per-channel
// subscription machinery for it.
function latestValuesForChannels(
  channelStore: WidgetComponentProps['channelStore'],
  channels: string[],
): (ChannelValue | undefined)[] {
  return channels.map((ch) => {
    const series = channelStore.series(ch);
    return series[series.length - 1]?.v;
  });
}

export function BarWidgetComponent({
  declaration,
  channelStore,
}: WidgetComponentProps<BarWidgetDeclaration>): JSX.Element {
  const { t } = useTranslation();
  const channels = !declaration.ch
    ? []
    : Array.isArray(declaration.ch)
      ? declaration.ch
      : [declaration.ch];
  const primary = channels[0] ?? declaration.id;
  const primarySeries = useChannelSeries(channelStore, primary); // subscribes this component to re-render on new data
  const latestByChannel = latestValuesForChannels(channelStore, channels);
  const stale = useStale(primarySeries[primarySeries.length - 1]?.t, declaration.stale);

  const bars = barsFromChannels(channels, latestByChannel, declaration.xlabels);
  const min = declaration.min ?? 0;
  const max = declaration.max ?? Math.max(1, ...bars.map((b) => b.value));
  const span = max - min || 1;

  return (
    <WidgetCard title={widgetTitle(declaration)} stale={stale} staleLabel={t('widgets.stale')}>
      <div
        style={{
          display: 'flex',
          flexDirection: declaration.horiz ? 'column' : 'row',
          alignItems: declaration.horiz ? 'stretch' : 'flex-end',
          gap: 4,
          height: '100%',
        }}
      >
        {bars.map((bar, i) => {
          const pct = Math.min(100, Math.max(0, ((bar.value - min) / span) * 100));
          return (
            <div
              key={i}
              title={`${bar.label}: ${bar.value}`}
              style={{
                display: 'flex',
                flexDirection: declaration.horiz ? 'row' : 'column',
                alignItems: 'center',
                flex: 1,
                gap: 2,
              }}
            >
              <div
                style={{
                  flex: declaration.horiz ? '0 0 auto' : 1,
                  width: declaration.horiz ? `${pct}%` : '100%',
                  height: declaration.horiz ? 16 : `${pct}%`,
                  background: 'var(--color-accent)',
                  alignSelf: declaration.horiz ? 'auto' : 'flex-end',
                }}
              />
              <span style={{ fontSize: '0.7em', color: 'var(--color-text-muted)' }}>
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}

export function BarWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<BarWidgetDeclaration>): JSX.Element {
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

export const barWidgetDemo: WidgetDemo<BarWidgetDeclaration> = {
  declaration: {
    t: 'w',
    id: 'demo-bar',
    k: 'bar',
    title: 'Spectrum',
    ch: 'demo-bar',
    min: 0,
    max: 100,
  },
  generate: (tickMs) => ({
    'demo-bar': [0, 1, 2, 3, 4, 5].map((i) => 50 + 40 * Math.sin(tickMs / 1000 + i)),
  }),
};
