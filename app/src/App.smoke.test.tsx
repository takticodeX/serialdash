import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';
import './i18n';

// A minimal render smoke test, not a full behavioral suite (that lands with M2's QA-01/QA-03
// once there's a protocol/session layer worth testing against SimulatorTransport). This exists to
// catch integration mistakes — a bad import, a hook called outside its provider, a crash on
// mount — that `tsc` and `vite build` don't.
describe('App', () => {
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

  it('renders the unsupported-browser screen when navigator.serial is absent (APP-GEN-02)', () => {
    act(() => root.render(<App />));
    expect(container.textContent).toContain("This browser can't talk to a serial port");
  });
});
