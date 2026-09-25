import { lazy } from 'react';
import { registerWidget } from './registry';
import { LineWidgetComponent, LineWidgetConfigPanel, lineWidgetDemo } from './line/LineWidget';
import { ValueWidgetComponent, ValueWidgetConfigPanel, valueWidgetDemo } from './value/ValueWidget';
import { gaugeWidgetDemo } from './gauge/gaugeDemo';
import { LedWidgetComponent, LedWidgetConfigPanel, ledWidgetDemo } from './led/LedWidget';
import { LogWidgetComponent, LogWidgetConfigPanel, logWidgetDemo } from './log/LogWidget';

// SPEC.md §2.2: "ECharts e i widget pesanti caricati in lazy loading" — the gauge widget is the
// only P0 widget using ECharts, so its Component/ConfigPanel (and everything they import) load
// only once a gauge widget actually needs to render, not at app boot.
const GaugeWidgetComponent = lazy(() =>
  import('./gauge/GaugeWidget').then((m) => ({ default: m.GaugeWidgetComponent })),
);
const GaugeWidgetConfigPanel = lazy(() =>
  import('./gauge/GaugeWidget').then((m) => ({ default: m.GaugeWidgetConfigPanel })),
);

let registered = false;

/** Registers the P0 display widgets (SPEC.md §4.1). Idempotent — safe to call from multiple entry
 * points (app boot, tests) without double-registering. */
export function registerBuiltinWidgets(): void {
  if (registered) return;
  registered = true;

  registerWidget({
    kind: 'line',
    nameKey: 'widgets.line.name',
    descriptionKey: 'widgets.line.description',
    icon: '📈',
    defaultSize: [6, 4],
    Component: LineWidgetComponent,
    ConfigPanel: LineWidgetConfigPanel,
    demo: lineWidgetDemo,
  });

  registerWidget({
    kind: 'value',
    nameKey: 'widgets.value.name',
    descriptionKey: 'widgets.value.description',
    icon: '🔢',
    defaultSize: [3, 2],
    Component: ValueWidgetComponent,
    ConfigPanel: ValueWidgetConfigPanel,
    demo: valueWidgetDemo,
  });

  registerWidget({
    kind: 'gauge',
    nameKey: 'widgets.gauge.name',
    descriptionKey: 'widgets.gauge.description',
    icon: '🌡️',
    defaultSize: [4, 4],
    Component: GaugeWidgetComponent,
    ConfigPanel: GaugeWidgetConfigPanel,
    demo: gaugeWidgetDemo,
  });

  registerWidget({
    kind: 'led',
    nameKey: 'widgets.led.name',
    descriptionKey: 'widgets.led.description',
    icon: '🔵',
    defaultSize: [3, 2],
    Component: LedWidgetComponent,
    ConfigPanel: LedWidgetConfigPanel,
    demo: ledWidgetDemo,
  });

  registerWidget({
    kind: 'log',
    nameKey: 'widgets.log.name',
    descriptionKey: 'widgets.log.description',
    icon: '📜',
    defaultSize: [6, 4],
    Component: LogWidgetComponent,
    ConfigPanel: LogWidgetConfigPanel,
    demo: logWidgetDemo,
  });
}

export * from './registry';
