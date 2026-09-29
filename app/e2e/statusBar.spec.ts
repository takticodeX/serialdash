import { test, expect } from '@playwright/test';

/**
 * APP-CON-06/08: the status bar's right-aligned buttons (change device, disconnect, settings)
 * sit in the same flex row rather than the settings gear floating as a `position: fixed` overlay
 * on top of them — regression test for a real bug where that overlay could land on top of and
 * swallow clicks on "Disconnect to upload a sketch" once the row got long enough to reach it.
 */

test('the settings button does not overlap or intercept clicks on the disconnect button', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try without hardware' }).click();
  await page.getByTestId('widget-demo-value').waitFor();

  const disconnectButton = page.getByRole('button', { name: 'Disconnect to upload a sketch' });
  const settingsButton = page.getByRole('button', { name: 'Settings', exact: true });
  await expect(disconnectButton).toBeVisible();
  await expect(settingsButton).toBeVisible();

  const disconnectBox = await disconnectButton.boundingBox();
  const settingsBox = await settingsButton.boundingBox();
  expect(disconnectBox).not.toBeNull();
  expect(settingsBox).not.toBeNull();
  // Bounding boxes must not intersect at all — a real overlap, not just "close together".
  const overlaps =
    disconnectBox!.x < settingsBox!.x + settingsBox!.width &&
    disconnectBox!.x + disconnectBox!.width > settingsBox!.x &&
    disconnectBox!.y < settingsBox!.y + settingsBox!.height &&
    disconnectBox!.y + disconnectBox!.height > settingsBox!.y;
  expect(overlaps).toBe(false);

  // And the click actually reaches the intended button rather than being intercepted.
  await settingsButton.click();
  await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  await disconnectButton.click();
  await expect(page.getByText('Disconnected')).toBeVisible();
});
