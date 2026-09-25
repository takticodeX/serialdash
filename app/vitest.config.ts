import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Deliberately separate from vite.config.ts: the CSP plugin there is a build-only concern. The
// PWA plugin is included in minimal form (just enough to resolve the virtual:pwa-register module
// UpdateBanner.tsx imports) rather than duplicating the full manifest/workbox config.
export default defineConfig({
  plugins: [react(), VitePWA({ registerType: 'autoUpdate', injectRegister: null })],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
