/**
 * Smoke: Contact + Conduct form controls are present and touch-sized @ phone.
 * (Replaces legacy CFS / Sponsor form smokes — those URLs now redirect.)
 */
import { expect, test } from '@playwright/test';

const MIN = 40;

test('Contact form fields render @ phone-standard', async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto('/contact', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#contact-name')).toBeVisible();
  await expect(page.locator('#contact-email')).toBeVisible();
  await expect(page.locator('#contact-message')).toBeVisible();
  const box = await page.locator('#contact-name').boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(MIN);
  await ctx.close();
});

test('Conduct report form fields render @ phone-standard', async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto('/conduct', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#coc-incident')).toBeVisible();
  await expect(page.locator('#coc-followup')).toBeVisible();
  const box = await page.locator('#coc-incident').boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(MIN);
  await ctx.close();
});
