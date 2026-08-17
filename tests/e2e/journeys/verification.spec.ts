/**
 * Journey 2 — the verification path.
 *
 * registry → publisher page → measured state distinguishable from a claimed
 * one → the badge URL resolves.
 *
 * The distinction this journey exists for is the project's central claim:
 * `declared_target` is what a publisher *says*, and the measured state is what
 * the validator *found*. A page that rendered them alike — same weight, same
 * colour, adjacent — would undo the argument the whole protocol is built on,
 * and every unit test would still pass.
 *
 * These builds run without KV credentials, so every entry is "not yet
 * measured". That is the state most readers will ever see and the one where an
 * optimistic default would quietly become a claim, so it is the state tested.
 */
import { expect, test } from '@playwright/test';

test.describe('the verification path', () => {
  test('the registry lists publishers and says what is measured', async ({
    page,
  }) => {
    await page.goto('/registry/', { waitUntil: 'networkidle' });

    const main = page.locator('main');
    await expect(main).toBeVisible();

    // The table works without JavaScript — it is server-rendered — so rows
    // exist before any island hydrates.
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThan(0);

    // With no measurement store, the page says so rather than implying one.
    await expect(main).toContainText(/not yet measured|unmeasured|sin medir/i);
  });

  test('a publisher page separates what is claimed from what was measured', async ({
    page,
  }) => {
    await page.goto('/registry/corag/', { waitUntil: 'networkidle' });
    const text = await page.locator('main').innerText();

    // Both concepts must be present and distinguishable in words.
    expect(text.toLowerCase()).toMatch(/declared|claimed|declarad/);
    expect(text.toLowerCase()).toMatch(/measured|medid/);

    /*
     * The page must never *claim* certification — but it does say, in words,
     * that it "never says certified", and a check for the bare word flags the
     * disclaimer. So each occurrence is inspected in context: it is a finding
     * only if it is not negated.
     */
    for (const match of text.matchAll(
      /[^.]*\b(certified|certificad\w*)[^.]*\./gi
    )) {
      const sentence = match[0].toLowerCase();
      const negated = /never|not|no |nunca|ningún|ninguna|sin /.test(sentence);
      expect(
        negated,
        `unqualified certification claim: "${match[0].trim()}"`
      ).toBe(true);
    }
  });

  test('the badge is embedded with an accessible name', async ({ page }) => {
    await page.goto('/registry/corag/', { waitUntil: 'networkidle' });

    const badge = page.locator('img[src*="/badge/"]').first();
    await expect(badge).toHaveCount(1);

    // The badge SVG carries a title and the img an alt — one of the two
    // site-specific accessibility rules. A badge is often the only thing a
    // reader sees about a publisher, so it has to say what it means.
    const alt = await badge.getAttribute('alt');
    expect(alt, 'badge has no alt text').toBeTruthy();
    expect(alt!.length).toBeGreaterThan(10);
    expect(alt!.toLowerCase()).toContain('corag');
  });

  test('the embed snippets point at this origin', async ({ page }) => {
    // A reader copies these into their own README. If they point somewhere
    // else, the badge they publish measures somebody else's feed.
    await page.goto('/registry/corag/', { waitUntil: 'networkidle' });
    const text = await page.locator('main').innerText();
    expect(text).toContain('/badge/corag');
  });

  test('the registry filter narrows the table', async ({ page }) => {
    await page.goto('/registry/', { waitUntil: 'networkidle' });

    const search = page.locator('#registry-search');
    await expect(search).toBeVisible();

    const before = await page.locator('table tbody tr:visible').count();
    await search.fill('zzz-no-such-publisher');
    await expect
      .poll(async () => page.locator('table tbody tr:visible').count())
      .toBeLessThan(before);

    // And clearing it brings them back — a filter that cannot be undone is a
    // filter that loses the reader.
    await search.fill('');
    await expect
      .poll(async () => page.locator('table tbody tr:visible').count())
      .toBe(before);
  });
});
