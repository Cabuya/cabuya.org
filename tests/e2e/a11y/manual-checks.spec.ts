import { expect, type Page, test } from '@playwright/test';

/**
 * The manual audit, automated where automating it does not weaken it.
 *
 * axe cannot see most of what an accessibility review is for: whether a
 * keyboard can reach everything, whether headings describe a structure or just
 * a size, whether an image's `alt` says something useful, whether 200% zoom
 * reflows or clips. Those are judgement calls — but several of them have a
 * mechanical *floor* that a machine can hold, and holding the floor here means
 * the human pass can spend its attention on the judgement.
 *
 * Findings and resolutions: `analysis_results/PERF_A11Y_BASELINE.md`.
 */

const ROUTES = [
  '/',
  '/es/',
  '/developers/quickstart/',
  '/developers/spec/0.1/3-the-feed/',
  '/developers/schemas/0.1/place-feed/',
  '/developers/validator/',
  '/registry/',
  '/registry/corag/',
  '/governance/',
  '/join/',
];

test.describe('structure', () => {
  for (const route of ROUTES) {
    test(`${route} has one h1 and no skipped heading level`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      const levels = await page.$$eval(
        'main h1, main h2, main h3, main h4',
        (nodes) => nodes.map((node) => Number(node.tagName[1]))
      );

      const h1s = await page.locator('main h1').count();
      expect(h1s, `${route}: exactly one h1 in main`).toBe(1);

      // A jump from h2 to h4 tells a screen-reader user a section is missing.
      const skipped: string[] = [];
      for (let i = 1; i < levels.length; i += 1) {
        if (levels[i] > levels[i - 1] + 1) {
          skipped.push(`h${levels[i - 1]} → h${levels[i]}`);
        }
      }
      expect(skipped, `${route}: skipped heading levels`).toEqual([]);
    });
  }

  test('every page has the landmarks a screen reader navigates by', async ({
    page,
  }) => {
    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      for (const role of ['banner', 'main', 'contentinfo']) {
        expect(
          await page
            .locator(
              `[role="${role}"], ${role === 'banner' ? 'header' : role === 'contentinfo' ? 'footer' : 'main'}`
            )
            .count(),
          `${route}: ${role}`
        ).toBeGreaterThan(0);
      }
    }
  });

  test('a skip link is the first thing a keyboard reaches', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => ({
      text: document.activeElement?.textContent?.trim() ?? '',
      href: (document.activeElement as HTMLAnchorElement)?.getAttribute('href'),
    }));
    expect(focused.href).toBe('#main-content');
    expect(focused.text.length).toBeGreaterThan(4);
  });
});

test.describe('images', () => {
  test('every image declares dimensions and a considered alt', async ({
    page,
  }) => {
    const findings: string[] = [];

    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: 'networkidle' });
      const images = await page.$$eval('img', (nodes) =>
        nodes.map((node) => ({
          src: node.getAttribute('src') ?? '',
          alt: node.getAttribute('alt'),
          width: node.getAttribute('width'),
          height: node.getAttribute('height'),
        }))
      );

      for (const image of images) {
        // Dimensions are a CLS requirement, not an a11y one — but they are
        // measured here because this is the pass that walks every image.
        if (!image.width || !image.height) {
          findings.push(`${route} ${image.src}: no width/height`);
        }
        // `alt` must be *present*. Empty is a decision (decorative); missing is
        // an omission, and a screen reader reads the filename instead.
        if (image.alt === null) {
          findings.push(`${route} ${image.src}: no alt attribute`);
        }
      }
    }

    expect(findings, 'image findings').toEqual([]);
  });
});

test.describe('keyboard', () => {
  test('every interactive element on the registry is reachable and visibly focused', async ({
    page,
  }) => {
    await page.goto('/registry/', { waitUntil: 'networkidle' });

    const interactive = await page
      .locator('main a[href], main button, main input, main select')
      .count();
    expect(interactive).toBeGreaterThan(5);

    // Walk far enough to pass through the filters and into the table.
    const invisible: string[] = [];
    for (let i = 0; i < interactive + 6; i += 1) {
      await page.keyboard.press('Tab');
      const state = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        return {
          tag: el.tagName,
          label: (el.textContent ?? el.getAttribute('aria-label') ?? '')
            .trim()
            .slice(0, 40),
          outline: style.outlineStyle,
          outlineWidth: style.outlineWidth,
          boxShadow: style.boxShadow,
        };
      });
      if (!state) continue;
      // Focus must be *visible*: an outline, or a ring drawn as a shadow.
      const visible =
        (state.outline !== 'none' && state.outlineWidth !== '0px') ||
        (state.boxShadow !== 'none' && state.boxShadow.length > 0);
      if (!visible) invisible.push(`${state.tag} "${state.label}"`);
    }

    expect(invisible, 'focused without a visible indicator').toEqual([]);
  });

  test('the mobile drawer traps nothing and closes on Escape', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const toggle = page.locator('header button[aria-controls="mobile-drawer"]');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    // Focus returns to the control that opened it, rather than to the top of
    // the document — otherwise closing a menu loses your place.
    const returned = await page.evaluate(() =>
      document.activeElement?.getAttribute('aria-controls')
    );
    expect(returned).toBe('mobile-drawer');
  });
});

test.describe('motion and zoom', () => {
  test('reduced motion is honoured', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'networkidle' });

    const moving = await page.evaluate(() => {
      const offenders: string[] = [];
      for (const el of document.querySelectorAll('*')) {
        const style = getComputedStyle(el);
        const duration = Number.parseFloat(style.transitionDuration) || 0;
        const animation = Number.parseFloat(style.animationDuration) || 0;
        // 0.2s is the threshold below which motion is not perceived as motion.
        if (duration > 0.2 || animation > 0.2) {
          offenders.push(
            `${el.tagName}.${(el as HTMLElement).className}`.slice(0, 60)
          );
        }
      }
      return offenders.slice(0, 5);
    });

    expect(moving, 'animating under prefers-reduced-motion').toEqual([]);
    await context.close();
  });

  test('200% zoom reflows without horizontal scrolling', async ({ page }) => {
    // 640×512 at 200% is the WCAG 1.4.10 reflow condition (1280×1024 CSS px).
    await page.setViewportSize({ width: 640, height: 512 });

    const overflowing: string[] = [];
    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      // One pixel of slack for sub-pixel rounding.
      if (overflow.scroll > overflow.client + 1) {
        overflowing.push(`${route}: ${overflow.scroll} > ${overflow.client}`);
      }
    }

    expect(overflowing, 'pages scrolling horizontally at 200% zoom').toEqual(
      []
    );
  });
});
