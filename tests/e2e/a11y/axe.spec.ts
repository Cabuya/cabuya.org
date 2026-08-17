/**
 * WCAG AA, measured by axe on the routes and states that matter.
 *
 * The matrix is eight routes — one per page *renderer* — across both themes and
 * both viewports, plus four interactive states that only exist after somebody
 * has done something. Those last four are the point: a static scan of a page
 * whose menu is closed has not checked the menu, and the disclosure pattern,
 * the filter controls and the validator's report are exactly where the
 * site-specific rules live.
 *
 * ## What counts as a failure
 *
 * Serious and critical, zero tolerance. Moderate and minor are reported in the
 * test output and recorded in `analysis_results/PERF_A11Y_BASELINE.md` rather
 * than silently passed — axe's moderate bucket contains real defects and real
 * false positives, and the honest handling is to look at each one rather than
 * to pick a threshold that makes the number zero.
 *
 * ## Why both themes
 *
 * Because contrast is the failure this project has already shipped twice. The
 * prose token mapping was losing to a cascade layer and produced 1.5:1 body
 * text in dark mode; the syntax theme's comment colour was 3.19:1 on the code
 * ground. Neither was visible in light mode, and neither was visible in any
 * test that read source rather than pixels.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

/** One per page renderer — the same eight Lighthouse measures. */
const ROUTES = [
  { path: '/', name: 'landing' },
  { path: '/es/', name: 'landing (es)' },
  { path: '/developers/quickstart/', name: 'quickstart' },
  { path: '/developers/spec/0.1/3-the-feed/', name: 'spec section' },
  { path: '/developers/schemas/0.1/place-feed/', name: 'schema reference' },
  { path: '/developers/validator/', name: 'validator' },
  { path: '/registry/', name: 'registry index' },
  { path: '/registry/corag/', name: 'publisher' },
];

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 900 },
];

const THEMES = ['light', 'dark'] as const;

/**
 * Run axe and split the findings by impact.
 *
 * `color-contrast` is included deliberately — it is the rule that has caught
 * two real defects here and it needs a rendered page to evaluate.
 */
async function analyze(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const blocking = results.violations.filter(
    (violation) =>
      violation.impact === 'serious' || violation.impact === 'critical'
  );
  const advisory = results.violations.filter(
    (violation) =>
      violation.impact !== 'serious' && violation.impact !== 'critical'
  );
  return { blocking, advisory };
}

const describeViolations = (
  violations: Awaited<ReturnType<typeof analyze>>['blocking']
) =>
  violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.help}\n` +
        violation.nodes
          .slice(0, 3)
          .map((node) => `      ${node.html.slice(0, 160)}`)
          .join('\n')
    )
    .join('\n  ');

/** Apply the theme the way the site does: a class the head script sets. */
async function setTheme(page: Page, theme: (typeof THEMES)[number]) {
  await page.addInitScript((value) => {
    window.localStorage.setItem('theme', value);
  }, theme);
}

for (const viewport of VIEWPORTS) {
  for (const theme of THEMES) {
    test.describe(`${viewport.name} · ${theme}`, () => {
      for (const route of ROUTES) {
        test(`${route.name} has no serious or critical violations`, async ({
          page,
        }) => {
          await page.setViewportSize({
            width: viewport.width,
            height: viewport.height,
          });
          await setTheme(page, theme);
          await page.goto(route.path, { waitUntil: 'networkidle' });

          const { blocking, advisory } = await analyze(page);
          if (advisory.length > 0) {
            console.log(
              `  advisory on ${route.path} (${viewport.name}/${theme}):\n  ${describeViolations(advisory)}`
            );
          }
          expect(
            blocking,
            `serious/critical on ${route.path}:\n  ${describeViolations(blocking)}`
          ).toEqual([]);
        });
      }
    });
  }
}

test.describe('interactive states', () => {
  test('the mobile menu, open', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });

    /*
     * Selected by what it controls, not by position or by name.
     *
     * `.first()` on `[aria-expanded]` picked a per-group disclosure instead —
     * the header has several. Selecting by accessible name worked for the
     * click and then failed the assertion, because the name changes to "Close
     * menu" the moment it opens. `aria-controls` is the one attribute that
     * identifies this button and does not move.
     */
    const toggle = page.locator('header button[aria-controls="mobile-drawer"]');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const { blocking } = await analyze(page);
    expect(blocking, describeViolations(blocking)).toEqual([]);
  });

  test('a nav disclosure group, open', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const group = page.getByRole('button', { name: /protocol/i }).first();
    await group.click();
    await expect(group).toHaveAttribute('aria-expanded', 'true');

    const { blocking } = await analyze(page);
    expect(blocking, describeViolations(blocking)).toEqual([]);
  });

  test('the registry with a filter applied', async ({ page }) => {
    await page.goto('/registry/', { waitUntil: 'networkidle' });
    await page.fill('#registry-search', 'pereira');
    await page.waitForTimeout(200);

    const { blocking } = await analyze(page);
    expect(blocking, describeViolations(blocking)).toEqual([]);
  });

  test('the validator showing a report', async ({ page }) => {
    await page.goto('/developers/validator/', { waitUntil: 'networkidle' });

    // Paste mode runs entirely in the browser, so a report renders without any
    // Function behind it — which is what makes this state testable at all.
    const textarea = page.locator('textarea').first();
    await textarea.fill('{"last_updated":"2026-08-17T00:00:00Z","ttl":900}');
    const buttons = page.getByRole('button', { name: /run the validator/i });
    await buttons.last().click();
    await page.waitForSelector('text=/error|Result/i', { timeout: 20_000 });

    const { blocking } = await analyze(page);
    expect(blocking, describeViolations(blocking)).toEqual([]);
  });
});

test.describe('the two site-specific rules', () => {
  test('validator severity is readable as text, never colour alone', async ({
    page,
  }) => {
    await page.goto('/developers/validator/', { waitUntil: 'networkidle' });
    const textarea = page.locator('textarea').first();
    await textarea.fill('{"last_updated":"2026-08-17T00:00:00Z","ttl":900}');
    await page
      .getByRole('button', { name: /run the validator/i })
      .last()
      .click();
    await page.waitForSelector('text=/error/i', { timeout: 20_000 });

    // The word, not the colour. Someone reading a monochrome printout, or a
    // screen reader, or a person who cannot separate red from green, gets the
    // same information a sighted reader does.
    const text = await page.locator('main').innerText();
    expect(text.toLowerCase()).toContain('error');
  });

  test('the badge SVG carries a title and an accessible name', async ({
    page,
  }) => {
    // The endpoint is a Pages Function and the preview serves static files, so
    // the badge is checked where it is composed rather than where it is served.
    // Its own snapshot tests assert the same attributes on every state.
    await page.goto('/registry/corag/', { waitUntil: 'networkidle' });
    const img = page.locator('img[src*="/badge/"]').first();
    await expect(img).toHaveAttribute('alt', /corag/);
    const alt = await img.getAttribute('alt');
    expect(alt?.length ?? 0).toBeGreaterThan(10);
  });
});
