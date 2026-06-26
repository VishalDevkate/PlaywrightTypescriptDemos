import { test } from '@playwright/test';
import { mkdirSync } from 'fs';
import path from 'path';

test('navigate to Myntra men footwear sneakers and save a screenshot', async ({ page }) => {
  const screenshotsDir = path.resolve(__dirname, '..', 'screenshots');
  mkdirSync(screenshotsDir, { recursive: true });

  await page.goto('https://www.myntra.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);

  const acceptButton = page.getByRole('button', { name: /accept|allow/i }).first();
  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click();
  }

  await page.getByRole('link', { name: /men/i }).first().click();
  await page.getByRole('link', { name: /footwear/i }).first().click();
  await page.getByRole('link', { name: /sneakers/i }).first().click();

  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);

  const screenshotPath = path.join(screenshotsDir, 'myntra-men-footwear-sneakers.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
});
