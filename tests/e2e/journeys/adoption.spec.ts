/**
 * Journey 1 — the adoption path.
 *
 * home → quickstart → copy the manifest → validator → paste → green, then a
 * deliberately broken paste that must produce a finding whose id resolves on
 * the checks page.
 *
 * This is the site's central promise made walkable. Every page in it can pass
 * its own tests while the path between them is broken — a copy button that
 * copies the wrong block, a validator that renders a finding whose id links
 * nowhere, a "five minutes" claim with no five-minute path behind it. Those
 * are only visible by walking it.
 */
import { expect, type Page, test } from '@playwright/test';

/** Wait for a Svelte island to be interactive rather than merely present. */
async function ready(page: Page, selector: string) {
  const element = page.locator(selector).first();
  await expect(element).toBeVisible();
  await expect(element).toBeEnabled();
}

test.describe('the adoption path', () => {
  test('a developer can walk from the landing page to a green validator run', async ({
    page,
  }) => {
    // ── 1. Land, and find the way in ────────────────────────────────
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/Cabuya/i);

    const toDevelopers = page
      .getByRole('link', { name: /developers|quickstart|start|documentation/i })
      .first();
    await expect(toDevelopers).toBeVisible();

    // ── 2. The quickstart ───────────────────────────────────────────
    await page.goto('/developers/quickstart/', { waitUntil: 'networkidle' });

    /*
     * Find the blocks by what they contain, not by position. The page opens
     * with an install command, and indexing by position would make this test
     * fail the day somebody reorders a section — which is a formatting change,
     * not a broken journey.
     *
     * Both blocks are checked, because the page says "twelve lines is a real
     * one, not a stub": a reader copies these two files and is finished.
     */
    const blocks = await page.locator('pre').allInnerTexts();
    const parsed = blocks
      .map((text) => {
        try {
          return JSON.parse(text.trim());
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const manifest = parsed.find((doc) => doc.protocol);
    expect(manifest, 'no complete manifest on the quickstart').toBeTruthy();
    expect(manifest.protocol.name).toBe('cabuya');
    expect(manifest.publisher?.publisher_id).toBeTruthy();
    expect(manifest.publisher?.canonical_url).toBeTruthy();
    expect(manifest.license).toBeTruthy();

    const feed = parsed.find((doc) => doc.data?.places);
    expect(feed, 'no complete feed on the quickstart').toBeTruthy();
    // Every required envelope field, so a reader who copies this has a
    // conforming envelope rather than a sketch of one.
    for (const field of [
      'last_updated',
      'ttl',
      'version',
      'publisher_id',
      'license',
    ]) {
      expect(feed[field], `feed example is missing ${field}`).toBeDefined();
    }
    // And the record must carry the confirmation key, present, even as null.
    expect(feed.data.places[0]).toHaveProperty('last_confirmed_at');

    // ── 3. The validator, with a conforming feed ────────────────────
    await page.goto('/developers/validator/', { waitUntil: 'networkidle' });
    await ready(page, 'textarea');

    const conforming = {
      last_updated: '2026-08-18T00:00:00Z',
      ttl: 900,
      version: '0.1.0',
      publisher_id: 'example-app',
      license: 'CC-BY-4.0',
      permitted_use: ['display'],
      data: {
        places: [
          {
            id: '1',
            publisher_id: 'example-app',
            name: 'Coliseo Municipal',
            place_kind: 'shelter',
            municipality_code: '66001',
            address_text: 'Calle 14 con Carrera 8',
            lifecycle_status: 'active',
            last_confirmed_at: null,
            source: { source_id: 'example-app', source_kind: 'first_party' },
            public_url: 'https://example.invalid/lugares/1',
          },
        ],
      },
    };

    await page
      .locator('textarea')
      .first()
      .fill(JSON.stringify(conforming, null, 2));
    await page
      .getByRole('button', { name: /run the validator/i })
      .last()
      .click();

    const main = page.locator('main');

    /*
     * Paste mode runs in the browser, with no network — so it cannot measure
     * the transport behaviour, and it says so rather than reporting a level it
     * did not establish. This is the site's own validator holding the line the
     * whole protocol rests on, and it is worth asserting here precisely
     * because "0 errors, looks good" is the tempting thing to render.
     */
    await expect(main).toContainText(/conformance unmeasured/i, {
      timeout: 20_000,
    });

    // A conforming document produces no ERROR-severity finding. Warnings are
    // fine and expected — this feed carries an address and no coordinates.
    const report = await main.innerText();
    const afterResult = report.slice(report.search(/result/i));
    expect(afterResult).not.toMatch(/\bERRORS?\s*\(\s*[1-9]/i);

    // And it must not claim a level from a run that measured none.
    expect(afterResult.toLowerCase()).not.toContain('conforming at');
  });

  test('a broken feed produces a finding whose id resolves on the checks page', async ({
    page,
  }) => {
    /*
     * The half of the loop that matters. A finding an implementer cannot look
     * up is a finding they cannot act on, and the id → checks-page anchor is
     * the only link between the two.
     */
    await page.goto('/developers/validator/', { waitUntil: 'networkidle' });
    await ready(page, 'textarea');

    // A record missing `last_confirmed_at` — the designed REC001 case.
    const broken = {
      last_updated: '2026-08-18T00:00:00Z',
      ttl: 900,
      version: '0.1.0',
      publisher_id: 'example-app',
      license: 'CC-BY-4.0',
      data: {
        places: [
          {
            id: '1',
            publisher_id: 'example-app',
            name: 'Coliseo Municipal',
            place_kind: 'shelter',
            municipality_code: '66001',
            address_text: 'Calle 14',
            lifecycle_status: 'active',
            source: { source_id: 'example-app' },
            public_url: 'https://example.invalid/lugares/1',
          },
        ],
      },
    };

    await page.locator('textarea').first().fill(JSON.stringify(broken));
    await page
      .getByRole('button', { name: /run the validator/i })
      .last()
      .click();

    const main = page.locator('main');
    await expect(main).toContainText(/last_confirmed_at/i, { timeout: 20_000 });

    // The severity is readable as a word, not only as a colour — one of the
    // two site-specific accessibility rules.
    await expect(main).toContainText(/error/i);

    // The parenthetical that stops an agent inventing a timestamp.
    await expect(main).toContainText(/null/i);

    // And the id must be present and resolvable.
    const body = await main.innerText();
    const id = body.match(/\b(REC|ENV|DSC|PII|BEH|LIC)\d{3}\b/)?.[0];
    expect(id, 'no check id in the report').toBeTruthy();

    await page.goto(`/developers/validator/checks/#${id}`, {
      waitUntil: 'networkidle',
    });
    const anchor = page.locator(`#${id}`);
    await expect(anchor, `${id} has no anchor on the checks page`).toHaveCount(
      1
    );
    await expect(anchor).toBeVisible();
  });

  test('the quickstart does not promise a path it cannot walk', async ({
    page,
  }) => {
    // Rule 0, as a journey: the page states how long this takes, and the
    // artefacts it hands over have to be the ones that make that true.
    await page.goto('/developers/quickstart/', { waitUntil: 'networkidle' });
    const text = await page.locator('main').innerText();

    // It claims minutes for the static path and an afternoon for a database.
    expect(text.toLowerCase()).toMatch(/minute|minuto/);
    expect(text.toLowerCase()).toMatch(/afternoon|tarde/);

    // And it never claims certification.
    expect(text.toLowerCase()).not.toContain('certified');
    expect(text.toLowerCase()).not.toContain('certificado');
  });
});
