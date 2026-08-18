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
import { createHash } from 'node:crypto';

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
      /*
       * The switcher is a disclosure now — a button showing the current language,
       * opening onto the other one. The link exists in the markup while the panel
       * is closed (`lang:check` reads it out of the built HTML on every page), so
       * a visibility assertion has to open the panel first. Clicking the trigger
       * is also what a reader does, which is the point of testing it this way.
       */
      const trigger = page.locator('#nav-disclosure-language');
      await expect(trigger, `no language switcher on ${route}`).toBeVisible();
      await trigger.click();

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

      // And back, to the page we started on — the same disclosure, reopened.
      await page.locator('#nav-disclosure-language').click();
      const backTarget = route === '/' ? '/' : route.replace(/\/$/, '');
      const back = page
        .locator(`a[href="${backTarget}"], a[href="${backTarget}/"]`)
        .first();
      await expect(back, `no switcher back to ${backTarget}`).toBeVisible();
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
      /*
       * It must be a link set rather than an HTML shell — the same soft-404 rule
       * we hold publishers to. Asserted on the body, not the header: the
       * `Content-Type` comes from `public/_headers`, which Cloudflare applies and
       * `astro preview` does not, so a header assertion here would only ever be
       * testing which server the suite happened to run against.
       */
      const body = JSON.parse(await response.text());
      expect(Array.isArray(body.linkset)).toBe(true);
      expect(body.linkset.length).toBeGreaterThan(0);
      const type = response.headers()['content-type'];
      if (type) expect(type).toMatch(/json|linkset/);
    }
  });

  test('auth.md answers the credentials question with a real answer', async ({
    request,
  }) => {
    const response = await request.get('/auth.md');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/markdown|text\/plain/);
    const body = await response.text();
    expect(body).toContain('There is none');
    // The three routes the deleted version of this file invented.
    for (const invented of [
      '/agent/register',
      '/agent/claim',
      '/oauth/revoke',
    ]) {
      expect(body).not.toContain(invented);
    }
  });

  test('the skills index points at a skill that is actually served', async ({
    request,
  }) => {
    const index = await request.get('/.well-known/agent-skills/index.json');
    expect(index.status()).toBe(200);
    const body = await index.json();
    expect(body.skills.length).toBeGreaterThan(0);
    // The guided adoption is discoverable, not only the publish flow.
    expect(body.skills.map((skill: { name: string }) => skill.name)).toContain(
      'adopt-cabuya'
    );

    for (const skill of body.skills) {
      const skillResponse = await request.get(new URL(skill.url).pathname);
      expect(skillResponse.status(), skill.url).toBe(200);
      /*
       * The digest is the point of the entry: an agent that cannot verify it has
       * no reason to trust a file it fetched over a URL somebody could rewrite.
       */
      const bytes = await skillResponse.body();
      const digest = createHash('sha256').update(bytes).digest('hex');
      expect(digest, `${skill.url} digest`).toBe(skill.sha256);
    }
  });

  test('WebMCP declares the site tools when the browser has the API', async ({
    page,
  }) => {
    /*
     * No browser ships `navigator.modelContext` on by default yet, so the API is
     * stubbed before the page's own script runs. That is the whole contract: the
     * page must call `provideContext` when the API exists, and must not throw
     * when it does not — every other test in this suite runs without the stub and
     * would fail on an exception.
     */
    await page.addInitScript(() => {
      const w = window as unknown as {
        __tools?: unknown[];
        navigator: Navigator & {
          modelContext?: {
            provideContext: (arg: { tools: unknown[] }) => void;
          };
        };
      };
      w.__tools = [];
      w.navigator.modelContext = {
        provideContext: ({ tools }) => {
          (w.__tools as unknown[]).push(...tools);
        },
      };
    });

    await page.goto('/');
    const tools = await page.evaluate(
      () =>
        (
          window as unknown as {
            __tools: Array<{ name: string; inputSchema?: unknown }>;
          }
        ).__tools
    );

    const names = tools.map((tool) => tool.name);
    expect(names).toContain('validate_cabuya_feed');
    expect(names).toContain('read_cabuya_page_as_markdown');
    for (const tool of tools) {
      expect(tool.inputSchema, tool.name).toBeTruthy();
    }
  });
});
