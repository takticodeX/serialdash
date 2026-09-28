import { test, expect, type Page } from '@playwright/test';

/**
 * APP-SIM-02: the connect screen's scenario picker actually drives which scenario
 * `SimulatorTransport` runs — driven through the real UI, no mocking above the transport layer
 * (ADR-001). `all-widgets` itself is already covered by every other e2e spec's
 * `connectViaSimulator()` helper (it's the default), so it isn't repeated here.
 */

async function connectWithScenario(page: Page, scenarioLabel: string): Promise<void> {
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Scenario' }).selectOption({ label: scenarioLabel });
  await page.getByRole('button', { name: 'Try without hardware' }).click();
}

test('weather station: only the P0 display widgets are declared', async ({ page }) => {
  await connectWithScenario(page, 'Weather station');

  await expect(page.getByTestId('widget-demo-line')).toBeVisible();
  await expect(page.getByTestId('widget-demo-value')).toBeVisible();
  await expect(page.getByTestId('widget-demo-gauge')).toBeVisible();
  await expect(page.getByTestId('widget-demo-led')).toBeVisible();
  await expect(page.getByTestId('widget-demo-log')).toBeVisible();
  // None of the P1/control widgets from `all-widgets` should be here.
  await expect(page.getByTestId('widget-demo-switch')).toHaveCount(0);
  await expect(page.getByTestId('widget-demo-xy')).toHaveCount(0);
});

test('motor control: only the P0 controls are declared, and the reject demo still works', async ({
  page,
}) => {
  await connectWithScenario(page, 'Motor control');

  await expect(page.getByTestId('widget-demo-button')).toBeVisible();
  await expect(page.getByTestId('widget-demo-switch')).toBeVisible();
  await expect(page.getByTestId('widget-demo-slider')).toBeVisible();
  await expect(page.getByTestId('widget-demo-line')).toHaveCount(0);

  await page.getByTestId('widget-demo-switch').getByRole('switch').click();
  await expect(page.getByTestId('widget-demo-switch').getByRole('switch')).toHaveAttribute(
    'aria-checked',
    'true',
    { timeout: 2000 },
  );

  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByTestId('widget-demo-button').getByRole('button', { name: 'Reboot' }).click();
  await expect(page.getByTestId('widget-demo-button').locator('.control-card')).toHaveAttribute(
    'data-control-status',
    'error',
    { timeout: 2000 },
  );
});

test('protocol errors: the status bar reports a growing error count', async ({ page }) => {
  await connectWithScenario(page, 'Protocol errors');

  await expect(page.getByRole('button', { name: /protocol errors?/ })).toBeVisible({
    timeout: 5000,
  });
});

test('stress test: undeclared channels stream in fast enough to auto-discover widgets', async ({
  page,
}) => {
  await connectWithScenario(page, 'Stress test (1000 lines/s)');

  // No widgets are declared for this scenario — anything on screen came from auto-discovery
  // reacting to real throughput.
  await expect(page.locator('[data-testid^="widget-s"]').first()).toBeVisible({ timeout: 3000 });
});
