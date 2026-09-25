import { useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { WidgetCard, useStale, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps, WidgetDemo } from '../registry';
import type { LineWidget as LineWidgetDeclaration } from '../../protocol/generated/index.js';

const DEFAULT_WINDOW_SECONDS = 30;

// uPlot draws nothing for a series with no explicit `stroke` — it does not fall back to a default
// palette color on its own, found by actually looking at the rendered chart rather than assuming.
const DEFAULT_SERIES_COLORS = ['#58a6ff', '#3fb950', '#d29922', '#bc8cff', '#ff7b72', '#39c5cf'];

function defaultSeriesColor(index: number): string {
  // Non-null: modulo against a known non-empty array's length is always in bounds.
  return DEFAULT_SERIES_COLORS[index % DEFAULT_SERIES_COLORS.length]!;
}

function channelsOf(ch: string | [string, ...string[]] | undefined): string[] {
  if (!ch) return [];
  return Array.isArray(ch) ? ch : [ch];
}

/**
 * SPEC.md §2.2 assigns uPlot specifically for streaming line charts — it's the only widget using
 * it, driven imperatively rather than through React state, since re-rendering React for every
 * incoming sample would defeat the point of a fast canvas chart.
 *
 * Multi-channel widgets assume all their channels arrive together on one `d` message (the common
 * case — `dash.data().add(...).add(...)`), so the first channel's timestamps are used as the
 * shared x-axis rather than merging independently-timed series.
 */
export function LineWidgetComponent({
  declaration,
  channelStore,
}: WidgetComponentProps<LineWidgetDeclaration>): JSX.Element {
  const { t } = useTranslation();
  const channels = useMemo(() => channelsOf(declaration.ch), [declaration.ch]);
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);
  const [latestTs, setLatestTs] = useState<number | undefined>(undefined);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const hasFixedRange = declaration.min !== undefined && declaration.max !== undefined;
    const stepper = uPlot.paths.stepped;

    const options: uPlot.Options = {
      width: container.clientWidth || 300,
      height: container.clientHeight || 150,
      scales: {
        x: { time: false },
        y: hasFixedRange
          ? { auto: false, range: [declaration.min as number, declaration.max as number] }
          : { auto: true },
      },
      legend: { show: channels.length > 1 },
      series: [
        {},
        ...channels.map((ch, i) => ({
          label: declaration.labels?.[i] ?? ch,
          width: 2,
          stroke: declaration.colors?.[i] ?? defaultSeriesColor(i),
          ...(declaration.fill ? { fill: 'rgba(88,166,255,0.15)' } : {}),
          ...(declaration.step && stepper ? { paths: stepper({ align: 1 }) } : {}),
        })),
      ],
      axes: [
        // x is "seconds ago" (0 = now, negative = further back) — see the update() effect below.
        { values: (_self: uPlot, ticks: number[]) => ticks.map((v) => `${v}s`) },
        declaration.unit !== undefined ? { label: declaration.unit } : {},
      ],
    };
    const plot = new uPlot(options, [[], ...channels.map(() => [])], container);
    plotRef.current = plot;

    const ro = new ResizeObserver(() => {
      plot.setSize({ width: container.clientWidth, height: container.clientHeight });
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      plot.destroy();
      plotRef.current = null;
    };
    // Re-create the plot if its structural config changes; data updates flow through separately.
  }, [
    channels,
    declaration.labels,
    declaration.colors,
    declaration.unit,
    declaration.fill,
    declaration.step,
    declaration.min,
    declaration.max,
  ]);

  useEffect(() => {
    let scheduled = false;
    const update = (): void => {
      const plot = plotRef.current;
      if (!plot) return;
      const winSeconds = declaration.win ?? DEFAULT_WINDOW_SECONDS;
      const now = Date.now();
      const cutoff = now - winSeconds * 1000;
      const allSeries = channels.map((ch) => channelStore.series(ch).filter((p) => p.t >= cutoff));
      // Seconds relative to now (0 = latest, negative = further back) rather than raw epoch
      // seconds — uPlot's non-time x-scale otherwise plots points ~1.8 billion apart from origin,
      // which is technically correct but unreadable and visually useless.
      const xs = (allSeries[0] ?? []).map((p) => (p.t - now) / 1000);
      const ys = allSeries.map((s) => s.map((p) => (typeof p.v === 'number' ? p.v : null)));
      plot.setData([xs, ...ys] as uPlot.AlignedData);
      const lastPoints = allSeries
        .map((s) => s[s.length - 1]?.t)
        .filter((t): t is number => t !== undefined);
      setLatestTs(lastPoints.length > 0 ? Math.max(...lastPoints) : undefined);
    };

    const schedule = (): void => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        update();
      });
    };

    const unsubscribes = channels.map((ch) => channelStore.subscribe(ch, schedule));
    update();
    return () => unsubscribes.forEach((u) => u());
  }, [channels, channelStore, declaration.win]);

  const stale = useStale(latestTs, declaration.stale);

  return (
    <WidgetCard title={widgetTitle(declaration)} stale={stale} staleLabel={t('widgets.stale')}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </WidgetCard>
  );
}

export function LineWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<LineWidgetDeclaration>): JSX.Element {
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
        Window (s)
        <input
          type="number"
          value={declaration.win ?? DEFAULT_WINDOW_SECONDS}
          onChange={(e) => onChange({ win: Number(e.target.value) })}
        />
      </label>
    </div>
  );
}

export const lineWidgetDemo: WidgetDemo<LineWidgetDeclaration> = {
  declaration: {
    t: 'w',
    id: 'demo-line',
    k: 'line',
    title: 'Sine wave',
    ch: ['demo-sine'],
    unit: 'V',
    min: -1.2,
    max: 1.2,
    win: 20,
  },
  generate: (tickMs) => ({ 'demo-sine': Math.sin(tickMs / 1000) }),
};
