/* 
write a seperate test. 1. go to myntra.com 2. go to men->footwear->sneakers 3. take a screenshot and save in screenshots folder
 */
import { test, expect, Page } from '@playwright/test';
import { mkdirSync } from 'fs';
import path from 'path';

test.use({ browserName: 'firefox' });

async function clickNavOrGoTo(page: Page, label: string, urlPath: string) {
  const link = page.locator('a').filter({ hasText: new RegExp(`^${label}$`, 'i') }).first();

  if ((await link.count()) > 0 && (await link.isVisible())) {
    await link.click({ timeout: 25000 });
    return;
  }

  await page.goto(`https://www.myntra.com${urlPath}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
}

test('navigate to Myntra men footwear sneakers and save a screenshot', async ({ page }) => {
  const screenshotsDir = path.resolve(__dirname, '..', 'screenshots');
  mkdirSync(screenshotsDir, { recursive: true });

  await page.goto('https://www.myntra.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);

  const acceptButton = page.getByRole('button', { name: /accept|allow/i }).first();
  if ((await acceptButton.count()) > 0 && (await acceptButton.isVisible())) {
    await acceptButton.click();
  }

  await clickNavOrGoTo(page, 'Men', '/shop/men');
  await clickNavOrGoTo(page, 'Footwear', '/men-footwear');
  await clickNavOrGoTo(page, 'Sneakers', '/men-sneakers');

  await expect(page).toHaveURL(/men-sneakers/, { timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);

  const screenshotPath = path.join(screenshotsDir, 'myntra-men-footwear-sneakers.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
});
