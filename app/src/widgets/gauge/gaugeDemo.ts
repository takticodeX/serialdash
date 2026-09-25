import type { WidgetDemo } from '../registry';
import type { GaugeWidget as GaugeWidgetDeclaration } from '../../protocol/generated/index.js';

/** Deliberately in its own module with no ECharts import: the registry needs this eagerly (to
 * list widgets and drive the simulator), but the ECharts-dependent Component/ConfigPanel in
 * GaugeWidget.tsx are lazy-loaded (SPEC.md §2.2 "ECharts e i widget pesanti caricati in lazy
 * loading") — importing this file must not pull ECharts in along with it. */
export const gaugeWidgetDemo: WidgetDemo<GaugeWidgetDeclaration> = {
  declaration: {
    t: 'w',
    id: 'demo-gauge',
    k: 'gauge',
    title: 'Humidity',
    ch: 'demo-gauge',
    unit: '%',
    min: 0,
    max: 100,
    zones: [
      [0, 30, '#e67e22'],
      [30, 70, '#2ecc71'],
      [70, 100, '#3498db'],
    ],
  },
  generate: (tickMs) => ({ 'demo-gauge': Math.round(50 + 40 * Math.sin(tickMs / 3000)) }),
};
