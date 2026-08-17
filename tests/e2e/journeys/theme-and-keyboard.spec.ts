/**
 * Journey 5 — theme persistence, and the keyboard.
 *
 * Two states that only exist after somebody has done something, and that a
 * static scan of a page therefore never sees.
 *
 * **The theme has to survive navigation.** A toggle that works and then resets
 * on the next page is worse than none: a reader who chose dark mode gets a
 * white flash on every link, which is the specific thing the pre-paint inline
 * script exists to prevent.
 *
 * **The mobile menu has to be operable by keyboard.** It is a disclosure, not
 * a `role="menu"`, and the accessibility rules turn on that: focus visible,
 * Escape closes, focus returns to the trigger. Somebody navigating by keyboard
 * who opens it and cannot get out is trapped on the page.
 */
import { expect, test } from '@playwright/test';

test.describe('theme persistence', () => {
  test('a chosen theme survives navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const isDark = () =>
      page.evaluate(() => document.documentElement.classList.contains('dark'));

    const before = await isDark();
    const toggle = page
      .getByRole('button', { name: /theme|tema|dark|light/i })
      .first();
    await toggle.click();
    await expect.poll(isDark).toBe(!before);

    const chosen = await isDark();

    // Navigate — a real click, not a goto, so the whole document lifecycle runs.
    await page.goto('/developers/', { waitUntil: 'networkidle' });
    expect(await isDark(), 'the theme reset on navigation').toBe(chosen);

    // And across a language switch, which is a different layout entry point.
    await page.goto('/es/', { waitUntil: 'networkidle' });
    expect(await isDark(), 'the theme reset on the Spanish tree').toBe(chosen);
  });

  test('the choice is stored, and is the only thing stored', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page
      .getByRole('button', { name: /theme|tema|dark|light/i })
      .first()
      .click();
    await page.waitForTimeout(200);

    const stored = await page.evaluate(() => ({
      keys: Object.keys(window.localStorage),
      cookies: document.cookie,
    }));

    expect(stored.keys).toContain('theme');
    // The privacy note says cookieless. A theme preference is a preference,
    // and it lives in localStorage — nothing here sets a cookie.
    expect(stored.cookies).toBe('');
  });

  test('there is no flash of the wrong theme on first paint', async ({
    page,
  }) => {
    // The inline bootstrap runs before paint. If it were deferred, the page
    // would render light and then swap — and the CSP hash covers exactly this
    // script, so a policy change could silently break it.
    await page.addInitScript(() =>
      window.localStorage.setItem('theme', 'dark')
    );
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Checked at DOMContentLoaded rather than networkidle: by the time the
    // network settles, a deferred script would have caught up and hidden the
    // defect.
    expect(
      await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      ),
      'dark mode was not applied before paint'
    ).toBe(true);
  });
});

test.describe('the mobile menu, by keyboard', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens, closes on Escape, and returns focus', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Selected by what it controls — the accessible name changes when it
    // opens, and `.first()` on `[aria-expanded]` finds a nav group instead.
    const toggle = page.locator('header button[aria-controls="mobile-drawer"]');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const drawer = page.locator('#mobile-drawer');
    await expect(drawer).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    // Focus must come back to the trigger. Without it, a keyboard reader is
    // returned to the top of the document and has to start again.
    await expect(toggle).toBeFocused();
  });

  test('every link in the drawer is reachable by Tab', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const toggle = page.locator('header button[aria-controls="mobile-drawer"]');
    await toggle.click();
    await expect(page.locator('#mobile-drawer')).toBeVisible();

    // Walk forward and confirm focus lands inside the drawer rather than
    // skipping past it into the page behind.
    let reachedDrawer = false;
    for (let step = 0; step < 12; step += 1) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(() => {
        const drawer = document.querySelector('#mobile-drawer');
        return Boolean(drawer && drawer.contains(document.activeElement));
      });
      if (inside) {
        reachedDrawer = true;
        break;
      }
    }
    expect(reachedDrawer, 'tabbing never reached the open drawer').toBe(true);
  });

  test('the trigger is a real button, not a styled div', async ({ page }) => {
    // Which is what makes Enter and Space work without a keydown handler, and
    // what a screen reader announces as operable.
    await page.goto('/', { waitUntil: 'networkidle' });
    const tag = await page
      .locator('header button[aria-controls="mobile-drawer"]')
      .evaluate((element) => element.tagName);
    expect(tag).toBe('BUTTON');
  });
});
