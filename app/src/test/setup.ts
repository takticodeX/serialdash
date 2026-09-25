// jsdom (the Vitest test environment) has no IndexedDB implementation — shim it so
// storage/db.ts works the same under test as it does in a real browser.
import 'fake-indexeddb/auto';

// jsdom also has no ResizeObserver (used by the console list and the line/gauge widgets to
// track their container size) — a no-op stub is enough for tests, which don't assert on layout.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- global polyfill assignment
(globalThis as any).ResizeObserver ??= ResizeObserverStub;

// jsdom also has no window.matchMedia — uPlot calls it at import time to track devicePixelRatio,
// and the app's own theme effect (useThemeEffect) uses it for prefers-color-scheme.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
