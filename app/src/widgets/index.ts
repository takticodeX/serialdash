import { lazy } from 'react';
import { registerWidget } from './registry';
import { LineWidgetComponent, LineWidgetConfigPanel, lineWidgetDemo } from './line/LineWidget';
import { ValueWidgetComponent, ValueWidgetConfigPanel, valueWidgetDemo } from './value/ValueWidget';
import { gaugeWidgetDemo } from './gauge/gaugeDemo';
import { LedWidgetComponent, LedWidgetConfigPanel, ledWidgetDemo } from './led/LedWidget';
import { LogWidgetComponent, LogWidgetConfigPanel, logWidgetDemo } from './log/LogWidget';
import {
  ButtonWidgetComponent,
  ButtonWidgetConfigPanel,
  buttonWidgetDemo,
} from './button/ButtonWidget';
import {
  SwitchWidgetComponent,
  SwitchWidgetConfigPanel,
  switchWidgetDemo,
} from './switch/SwitchWidget';
import {
  SliderWidgetComponent,
  SliderWidgetConfigPanel,
  sliderWidgetDemo,
} from './slider/SliderWidget';
import { LevelWidgetComponent, LevelWidgetConfigPanel, levelWidgetDemo } from './level/LevelWidget';
import { XyWidgetComponent, XyWidgetConfigPanel, xyWidgetDemo } from './xy/XyWidget';
import { BarWidgetComponent, BarWidgetConfigPanel, barWidgetDemo } from './bar/BarWidget';
import { pieWidgetDemo } from './pie/pieDemo';
import { TableWidgetComponent, TableWidgetConfigPanel, tableWidgetDemo } from './table/TableWidget';
import { heatWidgetDemo } from './heat/heatDemo';
import {
  NumberWidgetComponent,
  NumberWidgetConfigPanel,
  numberWidgetDemo,
} from './number/NumberWidget';
import {
  SelectWidgetComponent,
  SelectWidgetConfigPanel,
  selectWidgetDemo,
} from './select/SelectWidget';
import { TextWidgetComponent, TextWidgetConfigPanel, textWidgetDemo } from './text/TextWidget';
import { ColorWidgetComponent, ColorWidgetConfigPanel, colorWidgetDemo } from './color/ColorWidget';

// SPEC.md §2.2: "ECharts e i widget pesanti caricati in lazy loading" — gauge/pie/heat are the
// ECharts-dependent kinds, so their Component/ConfigPanel (and everything they import) load only
// once one actually needs to render, not at app boot. Each kind's demo lives in its own
// ECharts-free module (see e.g. gaugeDemo.ts) specifically so the registry can list/simulate them
// eagerly without pulling ECharts in along with it.
const GaugeWidgetComponent = lazy(() =>
  import('./gauge/GaugeWidget').then((m) => ({ default: m.GaugeWidgetComponent })),
);
const GaugeWidgetConfigPanel = lazy(() =>
  import('./gauge/GaugeWidget').then((m) => ({ default: m.GaugeWidgetConfigPanel })),
);
const PieWidgetComponent = lazy(() =>
  import('./pie/PieWidget').then((m) => ({ default: m.PieWidgetComponent })),
);
const PieWidgetConfigPanel = lazy(() =>
  import('./pie/PieWidget').then((m) => ({ default: m.PieWidgetConfigPanel })),
);
const HeatWidgetComponent = lazy(() =>
  import('./heat/HeatWidget').then((m) => ({ default: m.HeatWidgetComponent })),
);
const HeatWidgetConfigPanel = lazy(() =>
  import('./heat/HeatWidget').then((m) => ({ default: m.HeatWidgetConfigPanel })),
);

let registered = false;

/** Registers every built-in widget (SPEC.md §4). Idempotent — safe to call from multiple entry
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
    defaultSize: [4, 12],
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

  registerWidget({
    kind: 'button',
    nameKey: 'widgets.button.name',
    descriptionKey: 'widgets.button.description',
    icon: '🔘',
    defaultSize: [3, 2],
    Component: ButtonWidgetComponent,
    ConfigPanel: ButtonWidgetConfigPanel,
    demo: buttonWidgetDemo,
  });

  registerWidget({
    kind: 'switch',
    nameKey: 'widgets.switch.name',
    descriptionKey: 'widgets.switch.description',
    icon: '🎚️',
    defaultSize: [3, 2],
    Component: SwitchWidgetComponent,
    ConfigPanel: SwitchWidgetConfigPanel,
    demo: switchWidgetDemo,
  });

  registerWidget({
    kind: 'slider',
    nameKey: 'widgets.slider.name',
    descriptionKey: 'widgets.slider.description',
    icon: '🎛️',
    defaultSize: [4, 2],
    Component: SliderWidgetComponent,
    ConfigPanel: SliderWidgetConfigPanel,
    demo: sliderWidgetDemo,
  });

  registerWidget({
    kind: 'level',
    nameKey: 'widgets.level.name',
    descriptionKey: 'widgets.level.description',
    icon: '📊',
    defaultSize: [3, 3],
    Component: LevelWidgetComponent,
    ConfigPanel: LevelWidgetConfigPanel,
    demo: levelWidgetDemo,
  });

  registerWidget({
    kind: 'xy',
    nameKey: 'widgets.xy.name',
    descriptionKey: 'widgets.xy.description',
    icon: '✳️',
    defaultSize: [4, 4],
    Component: XyWidgetComponent,
    ConfigPanel: XyWidgetConfigPanel,
    demo: xyWidgetDemo,
  });

  registerWidget({
    kind: 'bar',
    nameKey: 'widgets.bar.name',
    descriptionKey: 'widgets.bar.description',
    icon: '📶',
    defaultSize: [4, 4],
    Component: BarWidgetComponent,
    ConfigPanel: BarWidgetConfigPanel,
    demo: barWidgetDemo,
  });

  registerWidget({
    kind: 'pie',
    nameKey: 'widgets.pie.name',
    descriptionKey: 'widgets.pie.description',
    icon: '🥧',
    defaultSize: [4, 4],
    Component: PieWidgetComponent,
    ConfigPanel: PieWidgetConfigPanel,
    demo: pieWidgetDemo,
  });

  registerWidget({
    kind: 'table',
    nameKey: 'widgets.table.name',
    descriptionKey: 'widgets.table.description',
    icon: '🗂️',
    defaultSize: [4, 4],
    Component: TableWidgetComponent,
    ConfigPanel: TableWidgetConfigPanel,
    demo: tableWidgetDemo,
  });

  registerWidget({
    kind: 'heat',
    nameKey: 'widgets.heat.name',
    descriptionKey: 'widgets.heat.description',
    icon: '🌈',
    defaultSize: [4, 4],
    Component: HeatWidgetComponent,
    ConfigPanel: HeatWidgetConfigPanel,
    demo: heatWidgetDemo,
  });

  registerWidget({
    kind: 'number',
    nameKey: 'widgets.number.name',
    descriptionKey: 'widgets.number.description',
    icon: '🔟',
    defaultSize: [3, 2],
    Component: NumberWidgetComponent,
    ConfigPanel: NumberWidgetConfigPanel,
    demo: numberWidgetDemo,
  });

  registerWidget({
    kind: 'select',
    nameKey: 'widgets.select.name',
    descriptionKey: 'widgets.select.description',
    icon: '📋',
    defaultSize: [3, 2],
    Component: SelectWidgetComponent,
    ConfigPanel: SelectWidgetConfigPanel,
    demo: selectWidgetDemo,
  });

  registerWidget({
    kind: 'text',
    nameKey: 'widgets.text.name',
    descriptionKey: 'widgets.text.description',
    icon: '✏️',
    defaultSize: [3, 2],
    Component: TextWidgetComponent,
    ConfigPanel: TextWidgetConfigPanel,
    demo: textWidgetDemo,
  });

  registerWidget({
    kind: 'color',
    nameKey: 'widgets.color.name',
    descriptionKey: 'widgets.color.description',
    icon: '🎨',
    defaultSize: [3, 2],
    Component: ColorWidgetComponent,
    ConfigPanel: ColorWidgetConfigPanel,
    demo: colorWidgetDemo,
  });
}

export * from './registry';
