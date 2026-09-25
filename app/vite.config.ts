import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// APP-NFR-05: restrictive CSP, no third-party runtime scripts. Only injected in production
// builds — Vite's dev server needs inline/eval script for HMR, which a strict CSP would break.
function cspPlugin(): Plugin {
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
  ].join('; ');

  return {
    name: 'serialdash-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<head>',
        `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`,
      );
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    cspPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // registered manually via virtual:pwa-register/react (UpdateBanner)
      manifest: {
        name: 'SerialDash',
        short_name: 'SerialDash',
        description: 'Serial monitor and live dashboard for Arduino/ESP32, running in the browser.',
        theme_color: '#2f6fed',
        background_color: '#f7f8fa',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
});
