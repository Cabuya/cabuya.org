/**
 * Journeys 3 and 4 — language integrity, and the agent surface.
 *
 * **Language integrity** is the promise that switching language keeps you on
 * the page you were reading. Under D-W1 the route slugs are English in both
 * languages, so a switcher only has to add or remove `/es` — which makes the
 * failure mode subtle rather than obvious: it lands you on the *home page* of
 * the other language, quietly, and every page still renders fine.
 *
 * **The agent surface** is the half of the site nobody looks at. A twin that
 * 404s, or that returns HTML because content negotiation broke, fails silently
 * for exactly the readers this project is built for — and it fails in a way no
 * human visit would ever reveal.
 */
import { expect, test } from '@playwright/test';

/** One per renderer, in the shape a reader actually navigates. */
const ROUTES = [
  '/',
  '/developers/',
  '/developers/quickstart/',
  '/developers/spec/0.1/',
  '/registry/',
  '/join/',
];

test.describe('language integrity', () => {
  for (const route of ROUTES) {
    test(`${route} round-trips EN → ES → EN on the same page`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: 'networkidle' });
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');

      /*
       * Select the switcher by where it *goes*, not by its label. Pages carry
       * two Spanish links: the switcher (labelled "ES", pointing at this page's
       * Spanish twin) and a plain "Español" link to the Spanish home. Matching
       * on the label picks whichever appears first in the DOM, which is how a
       * test can "prove" the switcher works while clicking a link to the home
       * page.
       */
      const target = `/es${route === '/' ? '' : route.replace(/\/$/, '')}`;
      const switcher = page
        .locator(`a[href="${target}"], a[href="${target}/"]`)
        .first();
      await expect(
        switcher,
        `no switcher to ${target} on ${route}`
      ).toBeVisible();
      await switcher.click();
      await page.waitForLoadState('networkidle');

      // The Spanish twin of the same page — not the Spanish home page.
      await expect(page.locator('html')).toHaveAttribute('lang', 'es');
      // Trailing slashes vary by host config, so compare normalised paths.
      const norm = (path: string) => path.replace(/\/+$/, '') || '/';

      const spanishPath = norm(new URL(page.url()).pathname);
      expect(spanishPath.startsWith('/es')).toBe(true);
      expect(
        norm(spanishPath.replace(/^\/es/, '')),
        `${route} switched to the wrong page`
      ).toBe(norm(route));

      // And back, to the page we started on.
      const backTarget = route === '/' ? '/' : route.replace(/\/$/, '');
      const back = page
        .locator(`a[href="${backTarget}"], a[href="${backTarget}/"]`)
        .first();
      await back.click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      expect(norm(new URL(page.url()).pathname)).toBe(norm(route));
    });
  }

  test('every page declares its alternates in both directions', async ({
    page,
  }) => {
    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      const en = page.locator('link[rel="alternate"][hreflang="en"]');
      const es = page.locator('link[rel="alternate"][hreflang="es"]');
      await expect(en, `${route} has no en alternate`).toHaveCount(1);
      await expect(es, `${route} has no es alternate`).toHaveCount(1);

      // x-default points at the canonical language, which is English here.
      const xDefault = page.locator(
        'link[rel="alternate"][hreflang="x-default"]'
      );
      await expect(xDefault, `${route} has no x-default`).toHaveCount(1);
    }
  });

  test('a Spanish page is genuinely in Spanish', async ({ page }) => {
    // The failure a URL check cannot see: `/es` rendering English strings.
    await page.goto('/es/', { waitUntil: 'networkidle' });
    const text = (await page.locator('main').innerText()).toLowerCase();

    // Function words, not vocabulary — protocol nouns are the same in both.
    const spanishMarkers = ['que', 'para', 'los', 'las', 'del'].filter((word) =>
      new RegExp(`\\b${word}\\b`).test(text)
    );
    expect(
      spanishMarkers.length,
      'the Spanish landing page reads as English'
    ).toBeGreaterThan(2);
  });
});

test.describe('the agent surface', () => {
  const TWINS = [
    '/',
    '/developers/quickstart/',
    '/registry/',
    '/developers/spec/0.1/',
  ];

  for (const route of TWINS) {
    test(`${route} serves a Markdown twin`, async ({ request }) => {
      /*
       * Two shapes, both correct: a leaf page's twin sits beside it
       * (`quickstart.md`), a section index's inside it (`registry/index.md`).
       * The journey asks whether a twin is reachable, not which spelling it
       * has — `md:check` is what verifies the mapping itself.
       *
       * The explicit path rather than `Accept: text/markdown`: negotiation is
       * a Pages Function, and `astro preview` does not run Functions. That
       * half is covered by the Function's own tests.
       */
      const base = route.replace(/\/$/, '');
      const candidates =
        route === '/' ? ['/index.md'] : [`${base}.md`, `${base}/index.md`];

      let body = '';
      let found = '';
      for (const url of candidates) {
        const response = await request.get(url);
        if (response.status() === 200) {
          body = await response.text();
          found = url;
          break;
        }
      }

      expect(found, `no twin at ${candidates.join(' or ')}`).toBeTruthy();
      expect(body.length, `${found} is empty`).toBeGreaterThan(200);
      // A twin, not an HTML page returned with a .md name.
      expect(body).not.toContain('<!DOCTYPE');
      expect(body).toMatch(/^#\s+/m);
      // The canonical line, so a copied document says where it came from.
      expect(body).toContain('cabuya.org');
    });
  }

  test('llms.txt is reachable and points at the quickstart', async ({
    request,
  }) => {
    const response = await request.get('/llms.txt');
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain('quickstart');
    expect(body).toContain('cabuya.org');
    // It must describe the protocol, not just list URLs.
    expect(body.length).toBeGreaterThan(500);
  });

  test('robots.txt is a real text document, which L2 requires', async ({
    request,
  }) => {
    // The site asks publishers for this as a precondition; it would be a poor
    // look to fail it here.
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
  });

  test('the manifest of our own agent surface resolves', async ({
    request,
  }) => {
    const response = await request.get('/.well-known/api-catalog');
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
      // If we publish one, it must be JSON rather than an HTML shell — the
      // same soft-404 rule we hold publishers to.
      expect(response.headers()['content-type']).toMatch(/json|linkset/);
    }
  });
});
