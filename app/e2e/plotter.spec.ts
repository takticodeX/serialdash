import { test, expect, type Page } from '@playwright/test';

/**
 * APP-DAT-04: Arduino Serial Plotter–style plain-text lines are recognized as data (fed through
 * the same auto-discovery path a real `d` message would be) while staying visible in the console
 * exactly as any other line would — driven through the real UI against `SimulatorTransport`, no
 * mocking above the transport layer (ADR-001).
 */

async function connectViaSimulator(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try without hardware' }).click();
  await expect(page.getByTestId('widget-demo-value')).toBeVisible();
}

async function injectPlotterLine(page: Page, text: string): Promise<void> {
  await page.evaluate((line) => {
    interface WithSimulator {
      __serialDashSimulator?: { injectRawLine: (text: string) => void };
    }
    (window as unknown as WithSimulator).__serialDashSimulator?.injectRawLine(line);
  }, text);
}

test('a plotter-style line auto-discovers a widget and stays visible in the console', async ({
  page,
}) => {
  await connectViaSimulator(page);

  await injectPlotterLine(page, 'plottertemp:23.4 plotterhum:58');

  // Auto-discovered widgets land in their own "Auto" tab (APP-DAT-03), separate from the
  // scenario's own "Principale" group — switch to it before looking for them.
  await page.getByRole('tab', { name: 'Auto' }).click();
  await expect(page.getByTestId('widget-plottertemp')).toBeVisible();
  await expect(page.getByTestId('widget-plotterhum')).toBeVisible();
  await expect(page.getByRole('log')).toContainText('plottertemp:23.4 plotterhum:58');
});

test('a label:value pair with a space after the colon parses the value, not just the label', async ({
  page,
}) => {
  await connectViaSimulator(page);

  // A real sketch's `Serial.println("spacetemp: " + String(value))` shape — space after the
  // colon. This used to silently mis-tokenize into {spacetemp: 0} plus a spurious "ch0" holding
  // the real number instead (Number('') is 0, not NaN — found testing against a real sketch).
  await injectPlotterLine(page, 'spacetemp: 7');
  await injectPlotterLine(page, 'spacehum: 14');

  await page.getByRole('tab', { name: 'Auto' }).click();
  await expect(page.getByTestId('widget-spacetemp')).toBeVisible();
  await expect(page.getByTestId('widget-spacehum')).toBeVisible();
  await expect(page.locator('[data-testid^="widget-ch"]')).toHaveCount(0);
});

test('turning off Plotter compatibility stops recognizing the same line as data', async ({
  page,
}) => {
  await connectViaSimulator(page);

  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page
    .getByRole('checkbox', { name: 'Recognize Arduino Serial Plotter–style text as data' })
    .uncheck();
  await page.getByRole('button', { name: 'Close' }).click();

  await injectPlotterLine(page, 'plotteroff:1 plotteroff2:2');

  // Still just a console line — no widget for it.
  await expect(page.getByRole('log')).toContainText('plotteroff:1 plotteroff2:2');
  await expect(page.getByTestId('widget-plotteroff')).not.toBeAttached();
});

test('a line that only superficially resembles plotter data is left as plain text', async ({
  page,
}) => {
  await connectViaSimulator(page);

  await injectPlotterLine(page, 'Error: sensor timeout');

  await expect(page.getByRole('log')).toContainText('Error: sensor timeout');
  // "Error" would be an invalid channel id shape to have guessed anyway, but the real point is
  // that a non-numeric value after the colon must reject the whole line, not just that token.
  await expect(page.getByTestId('widget-Error')).not.toBeAttached();
});
