import { useEffect, useRef, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import * as echarts from 'echarts/core';
import { GaugeChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { useChannelSeries } from '../../data/useChannelSeries';
import { WidgetCard, primaryChannel, useStale, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps } from '../registry';
import type { GaugeWidget as GaugeWidgetDeclaration } from '../../protocol/generated/index.js';

echarts.use([GaugeChart, CanvasRenderer]);

function zoneStops(
  zones: [number, number, string][] | undefined,
  min: number,
  max: number,
): Array<[number, string]> | undefined {
  if (!zones || zones.length === 0) return undefined;
  const span = max - min || 1;
  return zones.map(([, to, color]) => [Math.min(1, Math.max(0, (to - min) / span)), color]);
}

/** SPEC.md §2.2 assigns Apache ECharts to gauge/pie/heatmap/polar/histogram — imported modularly
 * (just the gauge series + canvas renderer) to keep the rest of the chart types out of the P0
 * bundle until they're actually needed (P1/P2 widgets, M5+). */
export function GaugeWidgetComponent({
  declaration,
  channelStore,
}: WidgetComponentProps<GaugeWidgetDeclaration>): JSX.Element {
  const { t } = useTranslation();
  const channel = primaryChannel(declaration.ch) ?? declaration.id;
  const series = useChannelSeries(channelStore, channel);
  const latest = series[series.length - 1];
  const stale = useStale(latest?.t, declaration.stale);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const chart = echarts.init(container);
    chartRef.current = chart;
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(container);
    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const value = typeof latest?.v === 'number' ? latest.v : declaration.min;
    const stops = zoneStops(declaration.zones, declaration.min, declaration.max);
    chart.setOption({
      series: [
        {
          type: 'gauge',
          min: declaration.min,
          max: declaration.max,
          axisLine: stops
            ? { lineStyle: { width: 12, color: stops } }
            : { lineStyle: { width: 12 } },
          pointer: { show: true },
          detail: {
            valueAnimation: true,
            formatter: (v: number) =>
              declaration.dec !== undefined ? v.toFixed(declaration.dec) : String(v),
          },
          data: [{ value, name: declaration.unit ?? '' }],
        },
      ],
    });
  }, [
    latest?.v,
    declaration.min,
    declaration.max,
    declaration.zones,
    declaration.dec,
    declaration.unit,
  ]);

  return (
    <WidgetCard title={widgetTitle(declaration)} stale={stale} staleLabel={t('widgets.stale')}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </WidgetCard>
  );
}

export function GaugeWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<GaugeWidgetDeclaration>): JSX.Element {
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
        Min
        <input
          type="number"
          value={declaration.min}
          onChange={(e) => onChange({ min: Number(e.target.value) })}
        />
      </label>
      <label>
        Max
        <input
          type="number"
          value={declaration.max}
          onChange={(e) => onChange({ max: Number(e.target.value) })}
        />
      </label>
    </div>
  );
}
