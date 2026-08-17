/**
 * Journey 6 — the developers portal keeps its own theme.
 *
 * The portal defaults to dark. That is a product decision about one surface:
 * it has a sidebar, a contents rail and code on every page, and dark is what a
 * reader of that surface expects. The landing is not that surface.
 *
 * A scoped default is only safe while it stays a *default*, and three rules
 * keep it from reading as a bug. Each has a test here, because each of them
 * fails silently — the page still works, it just behaves in the way that makes
 * a reader think something broke.
 *
 *   1. No flash. The class is on `<html>` before the document finishes
 *      parsing, so the page never paints light and repaint dark.
 *   2. The toggle does not lie. Pressing it inside the portal changes the
 *      portal and nothing else; pressing it outside does not reach in.
 *   3. It never overrides a reader who already chose. Someone who set light
 *      did so for a reason — for some readers dark type haloes and is
 *      genuinely harder to read — so an explicit site preference carries into
 *      the portal rather than being replaced by it.
 *
 * Each test starts from a clean origin, because the behaviour under test is
 * entirely about what is and is not in storage.
 */
import { expect, test } from '@playwright/test';

const PORTAL = '/developers/quickstart/';
const isDark = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.classList.contains('dark'));

/**
 * The header is a `client:idle` island, so the button exists in the markup
 * before it does anything. Clicking it too early is a no-op that reads as a
 * broken toggle — wait for hydration, which Svelte signals by taking over the
 * `aria-pressed` attribute.
 */
const themeToggle = async (page: import('@playwright/test').Page) => {
  const button = page.locator('button.theme-toggle').first();
  await button.waitFor({ state: 'visible' });
  await expect(button).toHaveAttribute('aria-pressed', /true|false/);
  return button;
};

test.describe('the portal theme scope', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('a reader with no preference gets a light landing and a dark portal', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(await isDark(page), 'the landing should not default to dark').toBe(
      false
    );

    await page.goto(PORTAL, { waitUntil: 'domcontentloaded' });
    expect(await isDark(page), 'the portal should default to dark').toBe(true);
  });

  test('the dark class is set before the document finishes parsing', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      document.addEventListener('readystatechange', () => {
        if (document.readyState === 'interactive') {
          (window as unknown as Record<string, unknown>).__themeAtParse =
            document.documentElement.className;
        }
      });
    });
    await page.goto(PORTAL, { waitUntil: 'domcontentloaded' });

    const atParse = await page.evaluate(
      () => (window as unknown as Record<string, string>).__themeAtParse
    );
    expect(
      atParse,
      'the theme must be resolved in the blocking script, not after hydration — otherwise the portal flashes light on every navigation'
    ).toContain('dark');
  });

  test('toggling inside the portal pins the portal and leaves the site alone', async ({
    page,
  }) => {
    await page.goto(PORTAL, { waitUntil: 'networkidle' });
    await (await themeToggle(page)).click();
    await expect
      .poll(() => isDark(page), {
        message: 'the toggle should flip the portal',
      })
      .toBe(false);

    await page.goto('/developers/', { waitUntil: 'domcontentloaded' });
    expect(
      await isDark(page),
      'the choice should survive the next portal page'
    ).toBe(false);

    const stored = await page.evaluate(() => ({
      site: localStorage.getItem('theme'),
      docs: localStorage.getItem('theme:docs'),
    }));
    expect(stored.docs, 'the portal preference is what was written').toBe(
      'light'
    );
    expect(
      stored.site,
      'the site preference must not be touched by a toggle inside the portal'
    ).toBeNull();

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(await isDark(page), 'the landing is unchanged').toBe(false);
  });

  test('an explicit site preference is carried into the portal, not overridden', async ({
    page,
  }) => {
    for (const chosen of ['light', 'dark'] as const) {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.evaluate((value) => {
        localStorage.clear();
        localStorage.setItem('theme', value);
      }, chosen);

      await page.goto(PORTAL, { waitUntil: 'domcontentloaded' });
      expect(
        await isDark(page),
        `a reader who explicitly chose ${chosen} should still get ${chosen} in the portal`
      ).toBe(chosen === 'dark');
    }
  });
});
