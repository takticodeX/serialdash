import { useEffect, useRef, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { useChannelSeries } from '../../data/useChannelSeries';
import { ConfigField, WidgetCard, primaryChannel, useStale, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps } from '../registry';
import type { PieWidget as PieWidgetDeclaration } from '../../protocol/generated/index.js';

echarts.use([PieChart, CanvasRenderer]);

/** SPEC.md §2.2 assigns ECharts to `pie` — lazy-loaded (see widgets/index.ts) same as `gauge`. */
export function PieWidgetComponent({
  declaration,
  channelStore,
}: WidgetComponentProps<PieWidgetDeclaration>): JSX.Element {
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
    const value = latest?.v;
    const data =
      value !== null && typeof value === 'object' && !Array.isArray(value)
        ? Object.entries(value as Record<string, number>).map(([name, v]) => ({ name, value: v }))
        : typeof value === 'number'
          ? [{ name: channel, value }]
          : [];
    chart.setOption({
      series: [
        {
          type: 'pie',
          radius: declaration.donut ? ['40%', '70%'] : '70%',
          label: { show: declaration.pct !== false, formatter: '{d}%' },
          data,
        },
      ],
    });
  }, [latest?.v, declaration.donut, declaration.pct, channel]);

  return (
    <WidgetCard title={widgetTitle(declaration)} stale={stale} staleLabel={t('widgets.stale')}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </WidgetCard>
  );
}

export function PieWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<PieWidgetDeclaration>): JSX.Element {
  return (
    <div>
      <ConfigField label="Title" kind="pie">
        <input
          type="text"
          value={declaration.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </ConfigField>
    </div>
  );
}
