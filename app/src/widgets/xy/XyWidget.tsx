import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useChannelSeries } from '../../data/useChannelSeries';
import { WidgetCard, primaryChannel, useStale, widgetTitle } from '../common';
import type { WidgetComponentProps, WidgetConfigPanelProps, WidgetDemo } from '../registry';
import type { XyWidget as XyWidgetDeclaration } from '../../protocol/generated/index.js';

const DEFAULT_TRAIL = 500;
const VIEWBOX = 200;

function isPair(v: unknown): v is [number, number] {
  return Array.isArray(v) && v.length === 2 && typeof v[0] === 'number' && typeof v[1] === 'number';
}

/** SPEC.md §4.1 `xy`: a scatter/line plot of `[x,y]` pairs — plain SVG, keeping the last `trail`
 * points (default 500) rather than every point ever received (unbounded growth, APP-DAT-01). */
export function XyWidgetComponent({
  declaration,
  channelStore,
}: WidgetComponentProps<XyWidgetDeclaration>): JSX.Element {
  const { t } = useTranslation();
  const channel = primaryChannel(declaration.ch) ?? declaration.id;
  const series = useChannelSeries(channelStore, channel);
  const trail = declaration.trail ?? DEFAULT_TRAIL;
  const points = series
    .filter((p) => isPair(p.v))
    .slice(-trail)
    .map((p) => p.v as [number, number]);
  const latest = series[series.length - 1];
  const stale = useStale(latest?.t, declaration.stale);

  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const xmin = declaration.xmin ?? Math.min(-1, ...xs);
  const xmax = declaration.xmax ?? Math.max(1, ...xs);
  const ymin = declaration.ymin ?? Math.min(-1, ...ys);
  const ymax = declaration.ymax ?? Math.max(1, ...ys);
  const xspan = xmax - xmin || 1;
  const yspan = ymax - ymin || 1;

  const toSvg = ([x, y]: [number, number]): [number, number] => [
    ((x - xmin) / xspan) * VIEWBOX,
    VIEWBOX - ((y - ymin) / yspan) * VIEWBOX,
  ];

  return (
    <WidgetCard title={widgetTitle(declaration)} stale={stale} staleLabel={t('widgets.stale')}>
      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        style={{ width: '100%', height: '100%' }}
        role="img"
        aria-label={widgetTitle(declaration)}
      >
        <rect
          x={0}
          y={0}
          width={VIEWBOX}
          height={VIEWBOX}
          fill="none"
          stroke="var(--color-border)"
        />
        {declaration.mode === 'lines' && points.length > 1 ? (
          <polyline
            points={points.map((p) => toSvg(p).join(',')).join(' ')}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={1.5}
          />
        ) : (
          points.map((p, i) => {
            const [sx, sy] = toSvg(p);
            return <circle key={i} cx={sx} cy={sy} r={1.5} fill="var(--color-accent)" />;
          })
        )}
      </svg>
    </WidgetCard>
  );
}

export function XyWidgetConfigPanel({
  declaration,
  onChange,
}: WidgetConfigPanelProps<XyWidgetDeclaration>): JSX.Element {
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

export const xyWidgetDemo: WidgetDemo<XyWidgetDeclaration> = {
  declaration: {
    t: 'w',
    id: 'demo-xy',
    k: 'xy',
    title: 'Position',
    ch: 'demo-xy',
    xmin: -1.2,
    xmax: 1.2,
    ymin: -1.2,
    ymax: 1.2,
    mode: 'lines',
  },
  generate: (tickMs) => ({
    'demo-xy': [Math.cos(tickMs / 1500), Math.sin(tickMs / 1500)],
  }),
};
