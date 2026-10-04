import { useEffect, useRef, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import * as echarts from 'echarts/core';
import { HeatmapChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { GridComponent, VisualMapComponent } from 'echarts/components';
import { useChannelSeries } from '../../data/useChannelSeries';
import { ConfigField, WidgetCard, primaryChannel, useStale, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps } from '../registry';
import type { HeatWidget as HeatWidgetDeclaration } from '../../protocol/generated/index.js';

echarts.use([HeatmapChart, CanvasRenderer, GridComponent, VisualMapComponent]);

const PALETTES: Record<string, string[]> = {
  thermal: ['#000428', '#004e92', '#e67e22', '#f1c40f', '#ffffff'],
  viridis: ['#440154', '#31688e', '#35b779', '#fde725'],
  gray: ['#000000', '#ffffff'],
};

/** SPEC.md §4.1 `heat`: a `rows`x`cols` matrix flattened into one array-valued channel — SPEC.md
 * §2.2 assigns ECharts here too, lazy-loaded like `gauge`/`pie`. */
export function HeatWidgetComponent({
  declaration,
  channelStore,
}: WidgetComponentProps<HeatWidgetDeclaration>): JSX.Element {
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
    const { rows, cols } = declaration;
    const flat = Array.isArray(latest?.v) ? (latest.v as number[]) : [];
    const cells: [number, number, number][] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = flat[r * cols + c];
        if (typeof v === 'number') cells.push([c, r, v]);
      }
    }
    const palette = PALETTES[declaration.palette ?? 'thermal'] ?? PALETTES.thermal;
    chart.setOption({
      grid: { top: 4, bottom: 4, left: 4, right: 4 },
      xAxis: { type: 'category', data: Array.from({ length: cols }, (_, i) => i), show: false },
      yAxis: { type: 'category', data: Array.from({ length: rows }, (_, i) => i), show: false },
      visualMap: {
        show: false,
        min: declaration.min ?? 0,
        max: declaration.max ?? 100,
        inRange: { color: palette },
      },
      series: [
        {
          type: 'heatmap',
          data: cells,
          itemStyle: { borderWidth: 0 },
          emphasis: { itemStyle: { borderColor: 'var(--color-text)', borderWidth: 1 } },
          progressive: declaration.interp ? 0 : undefined,
        },
      ],
    });
  }, [latest?.v, declaration]);

  return (
    <WidgetCard title={widgetTitle(declaration)} stale={stale} staleLabel={t('widgets.stale')}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </WidgetCard>
  );
}

export function HeatWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<HeatWidgetDeclaration>): JSX.Element {
  return (
    <div>
      <ConfigField label="Title" kind="heat">
        <input
          type="text"
          value={declaration.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </ConfigField>
    </div>
  );
}
