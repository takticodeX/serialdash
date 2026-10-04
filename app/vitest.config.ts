import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { configDefaults } from 'vitest/config';

// Deliberately separate from vite.config.ts: the CSP plugin there is a build-only concern. The
// PWA plugin is included in minimal form (just enough to resolve the virtual:pwa-register module
// UpdateBanner.tsx imports) rather than duplicating the full manifest/workbox config.
export default defineConfig({
  plugins: [react(), VitePWA({ registerType: 'autoUpdate', injectRegister: null })],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // e2e/*.spec.ts are Playwright tests (`npm run e2e`), not Vitest's — Vitest's default include
    // glob matches *.spec.ts too, and the two test() globals conflict if both try to claim them.
    exclude: [...configDefaults.exclude, 'e2e/**'],
    coverage: {
      // QA-02: minimum 85% line coverage on protocol, session, data — not the whole app. `all:
      // true` forces every matching file into the report (not just ones a test happened to
      // import), so an entirely-untested file drags the percentage down instead of silently not
      // counting.
      provider: 'v8',
      all: true,
      include: [
        'src/protocol/**/*.{ts,tsx}',
        'src/session/**/*.{ts,tsx}',
        'src/data/**/*.{ts,tsx}',
      ],
      exclude: [
        // Schema-generated (PRO-02) — never hand-edited, and already covered by its own
        // generator/validate-vectors path rather than this hand-written-code requirement.
        'src/protocol/generated/**',
        '**/*.test.{ts,tsx}',
      ],
      thresholds: {
        lines: 85,
      },
    },
  },
});
