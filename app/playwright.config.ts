import { defineConfig, devices } from '@playwright/test';

/**
 * QA-03: e2e suite driven by `SimulatorTransport` (APP-SIM-03's "Try without hardware"), so it
 * needs no real hardware and no mocking above the transport layer (ADR-001). Chromium-only,
 * matching APP-GEN-01 — the app itself refuses to run anywhere Web Serial isn't available, and
 * even the simulator path exercises Chromium-only UI (the connect screen's browser-support
 * check runs before the "try without hardware" button appears).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    locale: 'en-US',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Unset by default (bundled Chromium). Some dev sandboxes don't support the bundled
        // build and need the system-installed Chrome instead — set PLAYWRIGHT_CHANNEL=chrome
        // locally in that case; CI leaves this unset.
        channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
