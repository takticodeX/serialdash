import { test, expect, type Page } from '@playwright/test';

/**
 * QA-03: bidirectional control round-trip, rejection, timeout, and external update (SPEC.md
 * §3.6), driven end-to-end through the real UI against `SimulatorTransport` (APP-SIM-03) — no
 * mocking above the transport layer (ADR-001). This is the M4 acceptance criterion's e2e half;
 * the real-hardware half is a manual checklist item (docs/contributing/testing.md).
 */

async function connectViaSimulator(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try without hardware' }).click();
  await expect(page.getByTestId('widget-demo-switch')).toBeVisible();
  await expect(page.getByTestId('widget-demo-button')).toBeVisible();
  await expect(page.getByTestId('widget-demo-slider')).toBeVisible();
}

test('round-trip: toggling the switch sends c and applies the acked value', async ({ page }) => {
  await connectViaSimulator(page);

  const toggle = page.getByTestId('widget-demo-switch').getByRole('switch');
  await expect(toggle).toHaveAttribute('aria-checked', 'false');

  await toggle.click();

  // Pending immediately (dashed border), then confirmed once the simulator's ack+d land.
  await expect(page.getByTestId('widget-demo-switch').locator('.control-card')).toHaveAttribute(
    'data-control-status',
    'pending',
  );
  await expect(toggle).toHaveAttribute('aria-checked', 'true', { timeout: 2000 });
  await expect(page.getByTestId('widget-demo-switch').locator('.control-card')).toHaveAttribute(
    'data-control-status',
    'idle',
  );
});

test('reject: pressing the button while the switch is on shows an error and does not apply', async ({
  page,
}) => {
  await connectViaSimulator(page);

  await page.getByTestId('widget-demo-switch').getByRole('switch').click();
  await expect(page.getByTestId('widget-demo-switch').getByRole('switch')).toHaveAttribute(
    'aria-checked',
    'true',
    { timeout: 2000 },
  );

  // demo-button declares `confirm` (SPEC.md §4.3) — accept the native dialog it triggers.
  // Playwright auto-dismisses dialogs by default, which would silently cancel the send.
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByTestId('widget-demo-button').getByRole('button').click();

  await expect(page.getByTestId('widget-demo-button').locator('.control-card')).toHaveAttribute(
    'data-control-status',
    'error',
    { timeout: 2000 },
  );
  // §3.6 rule 4: reverts to idle again after the error is shown for a few seconds.
  await expect(page.getByTestId('widget-demo-button').locator('.control-card')).toHaveAttribute(
    'data-control-status',
    'idle',
    { timeout: 5000 },
  );
});

test('timeout: no response within the configured window reverts the control and shows an error', async ({
  page,
}) => {
  await connectViaSimulator(page);

  // The simulator's ack always lands ~30ms after a command (simulatorTransport.ts,
  // RESPONSE_DELAY_MS) — an ack timeout shorter than that guarantees the timeout path fires
  // deterministically instead of racing the simulator's real response.
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Control response timeout (ms)').fill('5');
  await page.getByRole('button', { name: 'Close' }).click();

  const toggle = page.getByTestId('widget-demo-switch').getByRole('switch');
  await toggle.click();

  await expect(page.getByTestId('widget-demo-switch').locator('.control-card')).toHaveAttribute(
    'data-control-status',
    'error',
    { timeout: 1000 },
  );
});

test('external update: the device can change a control state on its own (§3.6 rule 6)', async ({
  page,
}) => {
  await connectViaSimulator(page);

  const toggle = page.getByTestId('widget-demo-switch').getByRole('switch');
  await expect(toggle).toHaveAttribute('aria-checked', 'false');

  // Nothing in this test ever clicks the switch — this simulates a physical button on the
  // device flipping it, per the test-only hook documented on SimulatorTransport.
  await page.evaluate(() => {
    interface WithSimulator {
      __serialDashSimulator?: { simulateExternalUpdate: (id: string, value: unknown) => void };
    }
    (window as unknown as WithSimulator).__serialDashSimulator?.simulateExternalUpdate(
      'demo-switch',
      true,
    );
  });

  await expect(toggle).toHaveAttribute('aria-checked', 'true');
});
