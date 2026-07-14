/* 
write a seperate test. 1. go to myntra.com 2. go to men->footwear->sneakers 3. take a screenshot and save in screenshots folder
 */
import { test, expect, Page } from '@playwright/test';
import { mkdirSync } from 'fs';
import path from 'path';

test.use({ browserName: 'firefox' });

async function clickNavOrGoTo(page: Page, label: string, urlPath: string) {
  const link = page.locator('a').filter({ hasText: new RegExp(`^${label}$`, 'i') }).first();

  if ((await link.count()) > 0) {
    try {
      await link.waitFor({ state: 'visible', timeout: 25000 });
      await Promise.all([
        page.waitForURL(new RegExp(`${urlPath}`), { timeout: 60000 }),
        link.click({ timeout: 25000 }),
      ]);
      await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
      return;
    } catch (error) {
      // If the click is intercepted or the element becomes stale, use the direct URL fallback.
    }
  }

  await page.goto(`https://www.myntra.com${urlPath}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
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

test('search for sneakers on Myntra and verify search results', async ({ page }) => {
  await page.goto('https://www.myntra.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);

  const acceptButton = page.getByRole('button', { name: /accept|allow/i }).first();
  if ((await acceptButton.count()) > 0 && (await acceptButton.isVisible())) {
    await acceptButton.click();
  }

  const searchBox = page.locator('input[placeholder*="Search"]');
  await expect(searchBox).toBeVisible({ timeout: 20000 });
  await searchBox.fill('sneakers');
  await searchBox.press('Enter');

  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  await expect(page).toHaveURL(/sneakers/, { timeout: 30000 });

  // "text=sneakers" also matches the hidden nav dropdown link
  // ("Sneakers" under the Men > Footwear menu), which stays in the DOM
  // but isn't visible on the search results page. Scope to visible
  // elements only, and additionally verify actual product results rendered.

  await expect(
    page.locator(':visible:has-text("sneakers")').first()
  ).toBeVisible({ timeout: 30000 });

  const productCards = page.locator('.product-base, li.product-base');
  await expect(productCards.first()).toBeVisible({ timeout: 30000 });
  expect(await productCards.count()).toBeGreaterThan(0);
});