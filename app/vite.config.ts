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

// Published on GitHub Pages under the project's own subpath (no custom domain yet) — everything
// this project serves, app and docs alike, lives under this one prefix rather than at the domain
// root. Kept as a single constant so the app's own `base`, its dev proxy, and its runtime-caching
// pattern for the docs site can't drift out of sync with each other.
const BASE = '/serialdash/';

export default defineConfig({
  base: BASE,
  server: {
    // DOC-30/DOC-34: `<BASE>docs/` is served from this same origin in production, but in dev this
    // app's own Vite server (5173) knows nothing about the docs/ workspace — it's a wholly
    // separate VitePress project. Proxying to its dev server (`npm run docs:dev`, pinned to 5174
    // in docs/package.json, itself configured with the matching `<BASE>docs/` base) is what makes
    // the widget-panel "?" links actually resolve locally instead of falling through to this
    // app's own catch-all index.html.
    proxy: {
      [`${BASE}docs`]: { target: 'http://localhost:5174', changeOrigin: true },
    },
  },
  plugins: [
    react(),
    cspPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // registered manually via virtual:pwa-register/react (UpdateBanner)
      manifest: {
        name: 'Serial Dash',
        short_name: 'Serial Dash',
        description: 'Serial monitor and live dashboard for Arduino/ESP32, running in the browser.',
        theme_color: '#2f6fed',
        background_color: '#f7f8fa',
        display: 'standalone',
        start_url: BASE,
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // DOC-34: the docs site (VitePress, `docs/`) is a separate build deployed under this same
        // origin's `<BASE>docs/` path — its output isn't part of *this* build, so it can't be
        // listed in globPatterns above (that only sees files this Vite build produces). Caching it
        // at runtime instead means it becomes available offline once a page under `<BASE>docs/`
        // has actually been visited once, rather than being bundled into the initial install like
        // the app shell is.
        runtimeCaching: [
          {
            // Deliberately NOT `${BASE}docs/` here: vite-plugin-pwa's generateSW mode embeds this
            // matcher in the generated service worker by serializing the function's own source
            // text, not by bundling it with its closure — a reference to the outer `BASE` const
            // would compile fine but throw `BASE is not defined` inside the real service worker at
            // runtime (found by grepping the built sw.js for the literal, unresolved `${BASE}`
            // string instead of an actual path — it's never evaluated at build time). The literal
            // has to stay in sync with `BASE` above by hand.
            urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith('/serialdash/docs/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'docs',
              expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
});
