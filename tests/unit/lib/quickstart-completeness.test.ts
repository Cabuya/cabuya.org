/**
 * Can a reader who follows only this page reach L2?
 *
 * `quickstart-fixtures.test.ts` runs the two shipped JSON blocks through the
 * validator in degraded mode — deliberately, because that is "exactly what a
 * reader can control by editing the file the page shows them". That framing is
 * correct and it is also the blind spot: it means no test ever asked about the
 * checks a file cannot satisfy.
 *
 * Walking the quickstart end to end found one. Copying both files verbatim,
 * publishing them at stable URLs and pointing the validator at the manifest
 * returned `non-conformant: 1 error — ENV007`: `Access-Control-Allow-Origin: *`
 * is a response header, and the page said the job was two files. Adding the
 * header and nothing else returned `conforming at L2`.
 *
 * So this test asks the question the other one cannot: every blocking L2 check
 * must be accounted for, either by the fixtures or by something the page ships
 * to fix it. A check with no entry fails, which means adding one to the
 * catalogue forces somebody to decide which it is — the same ledger discipline
 * the Markdown-twin audit uses, for the same reason.
 */

import { CORS_RECIPES } from '@cabuya/validator';
import { describe, expect, it } from 'vitest';
import { quickstartSections } from '@/lib/quickstart-markdown';

/**
 * How each blocking L2 check is met by somebody following the quickstart.
 *
 * `fixture` — the shipped manifest or feed already satisfies it, and
 *   `quickstart-fixtures.test.ts` proves that on every run.
 * `page` — no file can satisfy it; the page has to tell the reader what to do,
 *   and the value is a phrase that must appear in the page's own content.
 */
const ACCOUNTED: Record<
  string,
  { how: 'fixture' } | { how: 'page'; needs: string }
> = {
  SCH001: { how: 'fixture' },
  ENV001: { how: 'fixture' },
  ENV002: { how: 'fixture' },
  ENV003: { how: 'fixture' },
  ENV006: { how: 'fixture' },
  ENV007: { how: 'page', needs: 'Access-Control-Allow-Origin' },
  REC001: { how: 'fixture' },
  REC002: { how: 'fixture' },
  REC003: { how: 'fixture' },
  REC004: { how: 'fixture' },
  REC006: { how: 'fixture' },
  REC007: { how: 'fixture' },
  REC009: { how: 'fixture' },
  REC010: { how: 'fixture' },
  REC012: { how: 'fixture' },
  REC015: { how: 'fixture' },
  REC018: { how: 'fixture' },
  PII001: { how: 'fixture' },
  PII002: { how: 'fixture' },
  PII003: { how: 'fixture' },
  PII004: { how: 'fixture' },
  PII006: { how: 'fixture' },
  BEH001: { how: 'fixture' },
  BEH002: { how: 'fixture' },
};

async function blockingChecks() {
  const { CHECKS } = await import('@cabuya/validator');
  return CHECKS.filter(
    (check) =>
      check.level === 'L2' && check.severity === 'error' && check.implemented
  );
}

describe('the quickstart covers every blocking L2 check', () => {
  it('accounts for each one, and has no entry for a check that is gone', async () => {
    const ids = (await blockingChecks()).map((check) => check.id).sort();
    expect(
      ids,
      'a blocking L2 check with no entry above is a check the quickstart may not cover — classify it as fixture or page'
    ).toEqual(Object.keys(ACCOUNTED).sort());
  });

  it.each(['en', 'es'] as const)(
    'ships the remedy for every page-answered check, in %s',
    (lang) => {
      const content = quickstartSections(lang)
        .flatMap((section) => [section.heading, ...section.lines])
        .join('\n');

      for (const [id, entry] of Object.entries(ACCOUNTED)) {
        if (entry.how !== 'page') continue;
        expect(
          content,
          `${id} cannot be satisfied by editing a file, and the ${lang} quickstart does not tell the reader what to do about it`
        ).toContain(entry.needs);
      }
    }
  );
});

describe('the CORS recipes', () => {
  it('cover the hosts a small publisher actually uses', () => {
    const ids = CORS_RECIPES.map((recipe) => recipe.id);
    for (const host of ['cloudflare-pages', 'netlify', 'nginx', 'apache']) {
      expect(ids, `no recipe for ${host}`).toContain(host);
    }
  });

  it('are written in both languages, never pasted between them', () => {
    for (const recipe of CORS_RECIPES) {
      expect(recipe.note.en.length, `${recipe.id} en`).toBeGreaterThan(40);
      expect(recipe.note.es.length, `${recipe.id} es`).toBeGreaterThan(40);
      expect(recipe.note.en, `${recipe.id} is the same string twice`).not.toBe(
        recipe.note.es
      );
    }
  });

  it('carry a snippet, or say why there is nothing to paste', () => {
    for (const recipe of CORS_RECIPES) {
      if (recipe.snippet) {
        expect(
          recipe.snippet,
          `${recipe.id} configures something else`
        ).toMatch(/Access-Control-Allow-Origin|AllowedOrigins/);
        continue;
      }
      // The only honest empty snippet is a host that sets the header itself.
      expect(
        recipe.note.en.toLowerCase(),
        `${recipe.id} ships no snippet and does not explain why`
      ).toMatch(/already sends|nothing to do/);
    }
  });
});
