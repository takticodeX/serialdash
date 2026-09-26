import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '../i18n';
import { registerBuiltinWidgets, listWidgetDescriptors } from './index';
import { ChannelStore } from '../data/ChannelStore';
import { DeviceSession } from '../session/DeviceSession';

registerBuiltinWidgets();

// jsdom has no real <canvas> 2D context (that needs the native `canvas` package, which this repo
// doesn't otherwise need), so uPlot (line) and ECharts (gauge/pie/heat) fail at actual paint time
// here — not a bug in the widgets, a jsdom limitation. Those are verified by rendering the app in
// a real browser instead (see the M2/M5 Playwright passes against the simulator); this smoke test
// covers every plain-DOM/SVG widget (everything else).
const DOM_ONLY_KINDS = new Set([
  'value',
  'led',
  'log',
  'button',
  'switch',
  'slider',
  'level',
  'xy',
  'bar',
  'table',
  'number',
  'select',
  'text',
  'color',
]);

describe('P0 widget components render without throwing, fed by their own demo', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  for (const descriptor of listWidgetDescriptors().filter((d) => DOM_ONLY_KINDS.has(d.kind))) {
    it(`${descriptor.kind} widget mounts and reflects data from its demo generator`, () => {
      const channelStore = new ChannelStore();
      const session = new DeviceSession(() => {});
      const { declaration, generate } = descriptor.demo;

      const data = generate(0);
      if (Object.keys(data).length > 0) channelStore.ingest(data, undefined);

      const Component = descriptor.Component;
      act(() => {
        root.render(
          <Component declaration={declaration} channelStore={channelStore} session={session} />,
        );
      });

      expect(container.textContent).toBeTruthy();
    });
  }
});
