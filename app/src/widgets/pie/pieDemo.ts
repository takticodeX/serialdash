import type { WidgetDemo } from '../registry';
import type { PieWidget as PieWidgetDeclaration } from '../../protocol/generated/index.js';

/** Deliberately in its own module with no ECharts import — see gaugeDemo.ts's comment. */
export const pieWidgetDemo: WidgetDemo<PieWidgetDeclaration> = {
  declaration: {
    t: 'w',
    id: 'demo-pie',
    k: 'pie',
    title: 'Consumption',
    ch: 'demo-pie',
    donut: true,
  },
  generate: (tickMs) => ({
    'demo-pie': {
      Pump: Math.round(80 + 40 * Math.sin(tickMs / 2000)),
      Lights: Math.round(30 + 20 * Math.cos(tickMs / 1500)),
      Fan: Math.round(15 + 10 * Math.sin(tickMs / 1000)),
    },
  }),
};
