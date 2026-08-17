/**
 * The site works under its own Content-Security-Policy.
 *
 * A CSP that breaks the site is not a security improvement; it is an outage
 * with a good reason. And the usual repair — restoring `unsafe-inline` until
 * the console goes quiet — turns the header into decoration. So the policy is
 * applied to real page loads here and every violation is a failure.
 *
 * `astro preview` does not apply `_headers` (that is Cloudflare Pages' job), so
 * the header is injected by intercepting the document response and adding it.
 * The policy text comes from the built `dist/_headers`, which is the file that
 * deploys — not a copy written for the test.
 *
 * Violations are collected two ways because neither alone is reliable: the
 * `securitypolicyviolation` DOM event fires for blocked resources in the page,
 * and Chromium also logs to the console. A test watching only the console
 * misses violations in frames; one watching only the event misses parser-level
 * blocks.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, type Page, test } from '@playwright/test';

/** The shipped policy, read from the artifact that deploys. */
function shippedPolicy(): string {
  const headers = readFileSync(
    join(process.cwd(), 'dist', '_headers'),
    'utf-8'
  );
  const line = headers
    .split('\n')
    .find((entry) => /^\s*Content-Security-Policy:/.test(entry));
  if (!line) throw new Error('no Content-Security-Policy in dist/_headers');
  return line.replace(/^\s*Content-Security-Policy:\s*/, '').trim();
}

const POLICY = shippedPolicy();

/** Apply the real policy to every document this page loads. */
async function underPolicy(page: Page): Promise<string[]> {
  const violations: string[] = [];

  // Only the document is intercepted. Re-fetching and re-fulfilling every
  // subresource is enough to stop the validator island responding at all —
  // with zero CSP violations reported, which is the worst kind of test
  // failure: one that looks like a finding and is an artefact of the
  // instrument. The header only ever needs to be on the HTML anyway.
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() !== 'document') {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), 'content-security-policy': POLICY },
    });
  });

  await page.addInitScript(() => {
    (window as unknown as { __cspViolations: string[] }).__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      (window as unknown as { __cspViolations: string[] }).__cspViolations.push(
        `${event.violatedDirective} blocked ${event.blockedURI || 'inline'}`
      );
    });
  });

  page.on('console', (message) => {
    const text = message.text();
    if (
      /content security policy|refused to (execute|load|apply|connect)/i.test(
        text
      )
    ) {
      violations.push(text);
    }
  });

  return violations;
}

async function collect(
  page: Page,
  consoleViolations: string[]
): Promise<string[]> {
  const fromEvents = await page.evaluate(
    () =>
      (window as unknown as { __cspViolations?: string[] }).__cspViolations ??
      []
  );
  return [...new Set([...consoleViolations, ...fromEvents])];
}

test.describe('the shipped policy', () => {
  test('has no unsafe-inline in script-src', () => {
    const scriptSrc = POLICY.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('script-src'));

    expect(scriptSrc).toBeTruthy();
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");

    // Hashes, not a wildcard. A policy with neither would be `'self'` only,
    // which would block every island the site ships.
    expect(scriptSrc).toMatch(/'sha256-[A-Za-z0-9+/=]{43,}'/);
  });

  test('allows exactly one third-party script origin', () => {
    const origins = POLICY.split(';')
      .map((part) => part.trim())
      .filter((part) => part.startsWith('script-src'))
      .flatMap((part) => part.split(/\s+/))
      .filter((token) => token.startsWith('https://'));

    expect(origins).toEqual(['https://static.cloudflareinsights.com']);
  });

  test('locks down the directives that matter when something is injected', () => {
    for (const directive of [
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "connect-src 'self'",
    ]) {
      expect(POLICY).toContain(directive);
    }
  });
});

/**
 * One per page renderer, plus the two that hydrate the most.
 */
const ROUTES = [
  { path: '/', name: 'landing' },
  { path: '/es/', name: 'landing (es)' },
  { path: '/developers/quickstart/', name: 'quickstart' },
  { path: '/developers/spec/0.1/3-the-feed/', name: 'spec section' },
  { path: '/developers/validator/', name: 'validator' },
  { path: '/registry/', name: 'registry' },
  { path: '/join/', name: 'join' },
];

for (const route of ROUTES) {
  test(`${route.name} loads clean under the policy`, async ({ page }) => {
    const consoleViolations = await underPolicy(page);
    await page.goto(route.path, { waitUntil: 'networkidle' });

    const violations = await collect(page, consoleViolations);
    expect(violations, `CSP violations on ${route.path}`).toEqual([]);
  });
}

test.describe('the interactive parts still work under it', () => {
  test('the theme toggle switches, so the inline bootstrap ran', async ({
    page,
  }) => {
    const consoleViolations = await underPolicy(page);
    await page.goto('/', { waitUntil: 'networkidle' });

    const before = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    await page
      .getByRole('button', { name: /theme|tema|dark|light/i })
      .first()
      .click();
    await page.waitForTimeout(200);
    const after = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    expect(
      after,
      'the theme did not change — the inline script was blocked'
    ).not.toBe(before);
    expect(await collect(page, consoleViolations)).toEqual([]);
  });

  test('an island hydrates', async ({ page }) => {
    const consoleViolations = await underPolicy(page);
    await page.goto('/developers/validator/', { waitUntil: 'networkidle' });

    // Paste mode runs entirely in the browser. If the island did not hydrate,
    // the textarea is inert and nothing renders.
    //
    const textarea = page.locator('textarea').first();
    await textarea.fill('{"last_updated":"2026-08-18T00:00:00Z","ttl":900}');
    const run = page.getByRole('button', { name: /run the validator/i }).last();
    await expect(run).toBeEnabled();
    await run.click();
    await page.waitForSelector('text=/error|Result/i', { timeout: 20_000 });

    expect(await collect(page, consoleViolations)).toEqual([]);
  });

  test('the registry filter works, so its module script ran', async ({
    page,
  }) => {
    const consoleViolations = await underPolicy(page);
    await page.goto('/registry/', { waitUntil: 'networkidle' });

    // The filter controls are hidden until the inline module unhides them —
    // which makes their visibility a direct test that the script executed.
    const search = page.locator('#registry-search');
    await expect(search).toBeVisible();
    await search.fill('pereira');
    await page.waitForTimeout(200);

    expect(await collect(page, consoleViolations)).toEqual([]);
  });
});
