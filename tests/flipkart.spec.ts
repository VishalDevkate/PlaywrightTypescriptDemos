import { test, expect } from '@playwright/test';

test('open Flipkart homepage and verify title', async ({ page }) => {
  await page.goto('https://www.flipkart.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });

  await expect(page).toHaveTitle(/Online Shopping Site|Flipkart/);
  await expect(page.locator('body')).toBeVisible();
});
