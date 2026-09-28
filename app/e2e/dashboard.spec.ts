import { test, expect, type Page } from '@playwright/test';

/**
 * QA-03: the M5 dashboard-editing flows (SPEC.md §5.5 APP-DSH-04..08), driven end-to-end through
 * the real UI against `SimulatorTransport` — no mocking above the transport layer (ADR-001).
 * Companion to controls.spec.ts (M4's bidirectional-control flows).
 */

async function connectViaSimulator(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try without hardware' }).click();
  await expect(page.getByTestId('widget-demo-value')).toBeVisible();
}

async function openPanel(page: Page, widgetTestId: string) {
  await page.getByTestId(widgetTestId).getByRole('button', { name: 'Widget settings' }).click();
  return page.getByRole('dialog', { name: 'Widget settings' });
}

test('override edit: changing a widget property overrides the device declaration, and reset reverts it', async ({
  page,
}) => {
  await connectViaSimulator(page);
  await expect(page.getByTestId('widget-demo-value')).toContainText('Mode');

  const panel = await openPanel(page, 'widget-demo-value');
  await panel.getByLabel('Title').fill('Custom Title');
  await panel.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByTestId('widget-demo-value')).toContainText('Custom Title');
  await expect(page.getByTestId('widget-demo-value')).not.toContainText('Mode');

  const panel2 = await openPanel(page, 'widget-demo-value');
  await panel2.getByRole('button', { name: 'Reset to device value' }).click();

  await expect(page.getByTestId('widget-demo-value')).toContainText('Mode');
});

test('kind switching: a numeric widget can be switched to a value-compatible kind (APP-DSH-05)', async ({
  page,
}) => {
  await connectViaSimulator(page);

  const panel = await openPanel(page, 'widget-demo-value');
  // ValueWidgetConfigPanel exposes Title + Unit; LevelWidgetConfigPanel exposes Title only —
  // the field disappearing is proof the switch actually re-rendered the new kind's panel,
  // not just relabeled the old one.
  await expect(panel.getByLabel('Unit')).toBeVisible();
  await panel.getByLabel('Widget type').selectOption('level');
  await expect(panel.getByLabel('Unit')).not.toBeVisible();
  await panel.getByRole('button', { name: 'Close' }).click();
});

test('add widget: a user-created widget appears on the grid without any device declaration', async ({
  page,
}) => {
  await connectViaSimulator(page);
  const widgetCount = async (): Promise<number> => page.locator('[data-testid^="widget-"]').count();

  const before = await widgetCount();

  await page.getByRole('button', { name: 'Add widget' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add widget' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Add' }).click();

  await expect(dialog).not.toBeVisible();
  await expect(async () => expect(await widgetCount()).toBe(before + 1)).toPass();
  await expect(page.locator('[data-testid^="widget-user-"]')).toHaveCount(1);
});

test('add widget: a control kind excludes ids that already have their own widget', async ({
  page,
}) => {
  await connectViaSimulator(page);

  await page.getByRole('button', { name: 'Add widget' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add widget' });
  await dialog.getByLabel('Type').selectOption('switch');

  // demo-switch already has its own native Switch widget (declareAll() in simulatorTransport.ts)
  // — offering it here would let a new "switch" widget silently take over that id/slot
  // (effectiveWidgets.ts is keyed by id) instead of adding a separate one. Other non-empty
  // channels (e.g. demo-sine, a plain data channel with no widget of its own) are still offered —
  // there's no way to know from here whether the device would recognize them as a control at all.
  await expect(dialog.getByRole('option', { name: 'demo-switch', exact: false })).toHaveCount(0);
});

test('add widget: the channel picker stays stable while incoming data keeps arriving', async ({
  page,
}) => {
  await connectViaSimulator(page);

  await page.getByRole('button', { name: 'Add widget' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add widget' });
  const channelSelect = dialog.locator('select').nth(1);
  const optionsBefore = await channelSelect.locator('option').allTextContents();

  // The dashboard re-renders on every simulator tick (300ms) while this dialog is open. The
  // channel list used to be recomputed from live channel data on every one of those renders,
  // appending each channel's latest value to its option text — a <select>'s options mutating out
  // from under the user while open is a real, previously-reported bug (not just a Playwright
  // artifact): most browsers glitch the open dropdown and stop registering clicks in it,
  // recoverable only via Esc. The list is now snapshotted once when the dialog opens instead.
  await page.waitForTimeout(1200);
  const optionsAfter = await channelSelect.locator('option').allTextContents();
  expect(optionsAfter).toEqual(optionsBefore);

  // The picker still works: selecting an option actually registers.
  await channelSelect.selectOption({ index: 0 });
  await expect(channelSelect).not.toHaveValue('');
});

test('lock layout: disables dragging and resizing on every widget until unchecked', async ({
  page,
}) => {
  await connectViaSimulator(page);
  const widget = page.getByTestId('widget-demo-value');

  // react-grid-layout adds a "react-draggable" class to each grid item iff isDraggable is true
  // (GridItem.js) — a direct, unambiguous signal of Grid.tsx's `isDraggable={!lockLayout}` wiring.
  // isResizable follows the same prop but react-resizable doesn't visually hide its handle via
  // CSS in this app (it just disables the handle's own drag), so it isn't independently checked
  // here — draggable/resizable are set from the same boolean in Grid.tsx anyway.
  await expect(widget).toHaveClass(/react-draggable\b/);

  await page.getByRole('checkbox', { name: 'Lock layout' }).check();
  await expect(widget).not.toHaveClass(/react-draggable\b/);

  await page.getByRole('checkbox', { name: 'Lock layout' }).uncheck();
  await expect(widget).toHaveClass(/react-draggable\b/);
});

test('profile export/import: importing a previously exported profile restores an override', async ({
  page,
}) => {
  await connectViaSimulator(page);

  const panel = await openPanel(page, 'widget-demo-value');
  await panel.getByLabel('Title').fill('Roundtrip Title');
  await panel.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByTestId('widget-demo-value')).toContainText('Roundtrip Title');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export profile' }).click();
  const download = await downloadPromise;
  const profilePath = await download.path();
  expect(profilePath).toBeTruthy();

  // Drop the override so the widget goes back to its device-declared title — the import below
  // must be what brings "Roundtrip Title" back, not a leftover in-memory override.
  const panel2 = await openPanel(page, 'widget-demo-value');
  await panel2.getByRole('button', { name: 'Reset to device value' }).click();
  await expect(page.getByTestId('widget-demo-value')).toContainText('Mode');

  // Sets the file directly on the (hidden) input rather than clicking "Import profile" first —
  // that button just forwards to a native file chooser, which Playwright can't drive without an
  // explicit filechooser listener; the input itself is a real, always-present DOM element.
  await page.locator('input[type="file"]').setInputFiles(profilePath!);

  await expect(page.getByTestId('widget-demo-value')).toContainText('Roundtrip Title');
});
