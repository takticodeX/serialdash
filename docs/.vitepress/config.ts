import { defineConfig } from 'vitepress';

// Published on GitHub Pages under the project's own subpath (no custom domain yet): the app lives
// at /serialdash/, this site at /serialdash/docs/ — both nested under the same prefix rather than
// the app sitting at the domain root, since this isn't a user/org root-pages repo or a custom
// domain pointed at one. Matches the BASE constant in app/vite.config.ts.
export default defineConfig({
  base: '/serialdash/docs/',
  title: 'Serial Dash',
  description:
    'A serial monitor and live dashboard for Arduino/ESP32, running entirely in the browser.',
  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/quick-start' },
      { text: 'Widgets', link: '/widgets/' },
      { text: 'Library', link: '/library/install' },
      { text: 'Protocol', link: '/protocol/overview' },
      { text: 'Contributing', link: '/contributing/architecture' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Quick start', link: '/guide/quick-start' },
            { text: 'Connecting', link: '/guide/connecting' },
            { text: 'Console', link: '/guide/console' },
            { text: 'Dashboard', link: '/guide/dashboard' },
            { text: 'Controls', link: '/guide/controls' },
            { text: 'Simulator', link: '/guide/simulator' },
            { text: 'Arduino Plotter compatibility', link: '/guide/plotter-compat' },
          ],
        },
      ],
      '/widgets/': [
        {
          text: 'Widget catalog',
          items: [
            { text: 'Overview', link: '/widgets/' },
            {
              text: 'Display',
              items: [
                { text: 'Line chart', link: '/widgets/line' },
                { text: 'Value', link: '/widgets/value' },
                { text: 'Gauge', link: '/widgets/gauge' },
                { text: 'Indicator (led)', link: '/widgets/led' },
                { text: 'Event log', link: '/widgets/log' },
                { text: 'XY plot', link: '/widgets/xy' },
                { text: 'Bar chart', link: '/widgets/bar' },
                { text: 'Pie chart', link: '/widgets/pie' },
                { text: 'Level bar', link: '/widgets/level' },
                { text: 'Table', link: '/widgets/table' },
                { text: 'Heatmap', link: '/widgets/heat' },
              ],
            },
            {
              text: 'Controls',
              items: [
                { text: 'Button', link: '/widgets/button' },
                { text: 'Switch', link: '/widgets/switch' },
                { text: 'Slider', link: '/widgets/slider' },
                { text: 'Number field', link: '/widgets/number' },
                { text: 'Select', link: '/widgets/select' },
                { text: 'Text field', link: '/widgets/text' },
                { text: 'Color picker', link: '/widgets/color' },
              ],
            },
          ],
        },
      ],
      '/library/': [
        {
          text: 'Arduino / ESP32 library',
          items: [
            { text: 'Install', link: '/library/install' },
            { text: 'Getting started', link: '/library/getting-started' },
            { text: 'API reference', link: '/library/api' },
            { text: 'Compile-time options', link: '/library/options' },
            { text: 'Memory footprint', link: '/library/memory' },
            { text: 'Examples', link: '/library/examples' },
          ],
        },
      ],
      '/protocol/': [
        {
          text: 'Protocol v1',
          items: [
            { text: 'Overview', link: '/protocol/overview' },
            { text: 'Message reference', link: '/protocol/messages' },
            { text: 'Controls', link: '/protocol/controls' },
            { text: 'Implementing it yourself', link: '/protocol/implementing' },
            { text: 'Changelog', link: '/protocol/changelog' },
          ],
        },
      ],
      '/contributing/': [
        {
          text: 'Contributing',
          items: [
            { text: 'Architecture', link: '/contributing/architecture' },
            { text: 'Adding a widget', link: '/contributing/adding-a-widget' },
            { text: 'Testing', link: '/contributing/testing' },
            {
              text: 'Architecture Decision Records',
              items: [
                {
                  text: 'ADR-001 Web Serial webapp',
                  link: '/contributing/adr/001-webapp-web-serial',
                },
                {
                  text: 'ADR-002 Flat app→device JSON',
                  link: '/contributing/adr/002-json-flat-app-to-device',
                },
                {
                  text: 'ADR-003 Channels separate from widgets',
                  link: '/contributing/adr/003-channels-separate-from-widgets',
                },
                {
                  text: 'ADR-004 Device as source of truth',
                  link: '/contributing/adr/004-device-source-of-truth',
                },
                { text: 'ADR-005 Stack choice', link: '/contributing/adr/005-stack' },
              ],
            },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/takticodeX/serialdash' }],

    search: { provider: 'local' },
  },
});
