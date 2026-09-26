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
  },
});
