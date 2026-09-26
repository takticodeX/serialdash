import type { WidgetDemo } from '../registry';
import type { HeatWidget as HeatWidgetDeclaration } from '../../protocol/generated/index.js';

/** Deliberately in its own module with no ECharts import — see gaugeDemo.ts's comment. */
export const heatWidgetDemo: WidgetDemo<HeatWidgetDeclaration> = {
  declaration: {
    t: 'w',
    id: 'demo-heat',
    k: 'heat',
    title: 'Thermal camera',
    ch: 'demo-heat',
    rows: 8,
    cols: 8,
    min: 20,
    max: 40,
    palette: 'thermal',
  },
  generate: (tickMs) => {
    const values: number[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const dx = c - 3.5;
        const dy = r - 3.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        values.push(Math.round(30 - dist + 4 * Math.sin(tickMs / 1000 + dist)));
      }
    }
    return { 'demo-heat': values };
  },
};
