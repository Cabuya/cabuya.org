/**
 * Every internal link the shipped site emits resolves to something.
 *
 * This is the check that was missing. `md:check` verifies each page *has* a
 * complete Markdown twin; `redirects:check` verifies each redirect resolves;
 * neither asks whether the links a page actually renders point at files that
 * exist. Twelve did not:
 *
 *   · ten "View as Markdown" links on section indexes, in both languages,
 *     built by appending `.md` to the pathname — right for a leaf page, wrong
 *     for an index, whose twin is emitted *inside* the directory;
 *   · `/es/llms.txt`, from a nav entry prefixed per language when the file is
 *     emitted once at the root;
 *   · `/es/404`, from the language switcher on the 404 page — a broken link on
 *     the page a reader reaches because something was already broken.
 *
 * All three were on the agent-facing surface, which is the half nobody looks
 * at. Found in the Task 50 review by walking `dist/`.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const DIST = join(process.cwd(), 'dist');

function htmlFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/** Does this root-relative path resolve to a file the host would serve? */
function resolves(href: string): boolean {
  const path = href.replace(/[#?].*$/, '').replace(/\/+$/, '');
  if (path === '') return existsSync(join(DIST, 'index.html'));
  const target = join(DIST, path);
  return (
    existsSync(target) ||
    existsSync(join(target, 'index.html')) ||
    existsSync(`${target}.html`)
  );
}

describe.skipIf(!existsSync(DIST))('every internal link resolves', () => {
  const pages = htmlFiles(DIST);

  it('has pages to check', () => {
    expect(pages.length).toBeGreaterThan(50);
  });

  it('points at no missing page, twin or asset', () => {
    const broken = new Map<string, string[]>();

    for (const page of pages) {
      const html = readFileSync(page, 'utf-8');
      for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
        const href = match[1];
        // Anchors and query-only links are the same document.
        if (href.startsWith('/#') || href.startsWith('/?')) continue;
        if (resolves(href)) continue;
        const where = page.slice(DIST.length + 1);
        broken.set(href, [...(broken.get(href) ?? []), where]);
      }
    }

    const report = [...broken.entries()]
      .map(
        ([href, linking]) => `  ${href}  ← ${linking.slice(0, 3).join(', ')}`
      )
      .join('\n');

    expect(broken.size, `broken internal links:\n${report}`).toBe(0);
  });

  it('serves the Markdown twin each page links to', () => {
    // The specific failure above, pinned on its own so a regression names
    // itself rather than arriving inside a list of every broken link.
    const missing: string[] = [];

    for (const page of pages) {
      const html = readFileSync(page, 'utf-8');
      for (const match of html.matchAll(/href="(\/[^"]*\.md)"/g)) {
        if (!resolves(match[1])) {
          missing.push(`${page.slice(DIST.length + 1)} → ${match[1]}`);
        }
      }
    }

    expect(missing, `twin links that 404:\n  ${missing.join('\n  ')}`).toEqual(
      []
    );
  });
});
