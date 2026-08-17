/**
 * `llms.txt` and `llms-full.txt`.
 *
 * The first file an agent reads, which makes it the worst place on the site for
 * a stale sentence: a person skims a wrong line and moves on, an agent acts on
 * it. Until this was generated, the file being served described the Corag
 * institutional site and pointed at a write API this protocol does not run —
 * for eight tasks, on a site whose whole thesis is that agents are primary
 * readers.
 *
 * So the assertions here are about what it must not say as much as what it
 * must: no write API, no unmeasured conformance, no route the chrome does not
 * advertise, and the person-level line stated rather than implied.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CHECKS } from '@cabuya/validator';
import { describe, expect, it } from 'vitest';

import { SITE_URL } from '@/lib/constances';
import { PORTAL_SECTIONS } from '@/lib/portal-nav';
import { NAV_GROUPS } from '@/lib/site-navigation';
import { specSections, specVersions } from '@/lib/spec-loader';

const ROOT = process.cwd();
const index = readFileSync(join(ROOT, 'public/llms.txt'), 'utf-8');
const full = readFileSync(join(ROOT, 'public/llms-full.txt'), 'utf-8');

describe('llms.txt', () => {
  it('uses the site origin the rest of the site uses', () => {
    // The generator cannot import `constances.ts` — it reads `import.meta.env`,
    // which does not exist outside Astro's build — so it carries the origin as
    // a literal. That is fine only while the two agree.
    expect(SITE_URL).toBe('https://cabuya.org');
    expect(index).toContain(SITE_URL);
  });

  it('describes this protocol, not the site that used to be here', () => {
    expect(index).toMatch(/^# Cabuya Protocol/);
    for (const gone of [
      'Corag',
      'Ayuda Directa',
      'ayuda.cabuya.org',
      'publicar_solicitud',
    ]) {
      expect(index, `stale reference: ${gone}`).not.toContain(gone);
      expect(full, `stale reference: ${gone}`).not.toContain(gone);
    }
  });

  it('tells an agent there is no write API here', () => {
    expect(index).toContain('no write API');
  });

  it('states the person-level line as a join prohibition', () => {
    expect(index).toContain('join prohibition, not a field');
    expect(index).toContain('link-out only');
  });

  it('never invites an unmeasured conformance claim', () => {
    expect(index).toContain('never self-declared');
    expect(index.toLowerCase()).not.toContain('certif');
  });

  it('carries the licensing terms an agent needs before reusing anything', () => {
    expect(index).toContain('CC0-1.0');
    expect(index).toContain('permitted_use');
  });

  it('lists every live route the chrome advertises', () => {
    const live: string[] = [];
    for (const group of NAV_GROUPS) {
      if (group.status !== 'live') continue;
      if (group.path) live.push(group.path);
      for (const child of group.children ?? []) {
        if (child.status === 'live') live.push(child.path);
      }
    }
    for (const section of PORTAL_SECTIONS) {
      for (const entry of section.entries) {
        if (entry.status === 'live') live.push(entry.path);
      }
    }

    for (const path of new Set(live)) {
      expect(index, `missing from llms.txt: ${path}`).toContain(
        `${SITE_URL}${path})`
      );
    }
  });

  it('gives a twin URL for every route it lists', () => {
    for (const line of index.split('\n')) {
      if (!line.startsWith('- [') || !line.includes('](')) continue;
      // Schema and RFC lines point at files and pages rather than twins.
      if (line.includes('.schema.json') || line.includes('/rfcs/')) continue;
      expect(line, line).toContain('.md');
    }
  });

  it('lists every specification section', () => {
    const version = specVersions()[0];
    for (const section of specSections(version)) {
      expect(index, section.slug).toContain(
        `/developers/spec/${version}/${section.slug}`
      );
    }
  });
});

describe('llms-full.txt', () => {
  it('inlines the specification rather than summarising it', () => {
    const version = specVersions()[0];
    for (const section of specSections(version)) {
      // The body itself, not a link to it. A summary of a specification is a
      // specification an agent will reconstruct, and a reconstructed
      // specification is a hallucinated one.
      const opening = section.body.trim().slice(0, 120);
      expect(full, `§${section.number} body missing`).toContain(opening);
    }
  });

  it('inlines every check with its rule', () => {
    for (const check of CHECKS) {
      expect(full, check.id).toContain(`## ${check.id} — ${check.title}`);
      expect(full, `${check.id} rule`).toContain(check.rule);
    }
  });

  it('marks the checks that are catalogued but not implemented', () => {
    const planned = CHECKS.filter((check) => !check.implemented);
    expect(planned.length).toBeGreaterThan(0);
    expect(full).toContain('catalogued, not implemented');
  });

  it('carries the consumption rules — the half that is usually forgotten', () => {
    expect(full).toContain('Consumption rules');
    expect(full).toContain('Dedupe by claim, not by authority');
  });

  it('starts with no frontmatter block leaking from a source file', () => {
    // The consumption page is collection content; its frontmatter is site
    // metadata and would read to an agent as protocol content.
    expect(full).not.toContain('section: consuming');
    expect(full).not.toContain('updated: 2026');
  });

  it('points back at the map', () => {
    expect(full).toContain(`${SITE_URL}/llms.txt`);
  });
});
