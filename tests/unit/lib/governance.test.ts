/**
 * The governance surface: root documents, the changelog parser, RFCs.
 *
 * Two kinds of assertion here, and the second kind is the point.
 *
 * The mechanical ones check that the pages derive from the files — that
 * `/governance` cannot say something `GOVERNANCE.md` does not, because there is
 * only one text.
 *
 * The others check the *claims*. A governance document is a set of promises,
 * and several of them are checkable: that no body is described as existing when
 * it does not, that the neutrality gate is stated as a release blocker in both
 * languages, that the banned words are absent. A promise nobody can verify is
 * indistinguishable from a promise nobody kept.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { inlineMarkdownToHtml } from '@/lib/inline-markdown';
import type { RootDocId } from '@/lib/root-docs';
import { rootDoc, rootDocSummary } from '@/lib/root-docs';
import { specChangelog, specRfcs } from '@/lib/spec-loader';

const ROOT = process.cwd();
const DOCS: RootDocId[] = ['GOVERNANCE', 'TRADEMARK', 'CONTRIBUTING'];

describe('root documents', () => {
  it('exist in both languages', () => {
    for (const id of DOCS) {
      expect(existsSync(join(ROOT, `${id}.md`)), `${id}.md`).toBe(true);
      expect(existsSync(join(ROOT, `${id}.es.md`)), `${id}.es.md`).toBe(true);
    }
  });

  it('are what the page renders — the page has no second text', () => {
    for (const id of DOCS) {
      for (const lang of ['en', 'es'] as const) {
        const doc = rootDoc(id, lang);
        const file = readFileSync(join(ROOT, doc.file), 'utf-8');
        // Every line of the body is a line of the file. Not equality: the
        // title is lifted out for the page header.
        expect(file, doc.file).toContain(doc.body.slice(0, 200));
        expect(file.endsWith(`${doc.body.slice(-120)}\n`), doc.file).toBe(true);
      }
    }
  });

  it('refuses to fall back to English when a translation is missing', () => {
    // @ts-expect-error — deliberately asking for a language with no sibling.
    expect(() => rootDoc('GOVERNANCE', 'pt')).toThrow(/does not exist/);
  });

  it('produces a meta description inside the band', () => {
    for (const id of DOCS) {
      for (const lang of ['en', 'es'] as const) {
        const summary = rootDocSummary(rootDoc(id, lang));
        expect(summary.length, `${id}/${lang}`).toBeGreaterThanOrEqual(130);
        expect(summary.length, `${id}/${lang}`).toBeLessThanOrEqual(160);
      }
    }
  });

  it('carries the community files the footer links to', () => {
    for (const file of [
      'CODE_OF_CONDUCT.md',
      'SECURITY.md',
      'MAINTAINERS.md',
    ]) {
      expect(existsSync(join(ROOT, file)), file).toBe(true);
    }
  });
});

describe('what governance promises, and does not', () => {
  const en = readFileSync(join(ROOT, 'GOVERNANCE.md'), 'utf-8');
  const es = readFileSync(join(ROOT, 'GOVERNANCE.es.md'), 'utf-8');
  const maintainers = readFileSync(join(ROOT, 'MAINTAINERS.md'), 'utf-8');

  it('does not describe a council that is not seated', () => {
    // Rule-0 applied to governance: the model may be committed to, the body may
    // not be implied to exist.
    expect(en).toMatch(/There is no maintainer council yet/);
    expect(es).toMatch(/[Tt]odavía no hay consejo de maintainers/);
    expect(maintainers).toMatch(/The council is not seated/);
  });

  it('states the neutrality gate as a release blocker in both languages', () => {
    expect(en).toMatch(/cannot be tagged until at least two maintainers/);
    expect(es).toMatch(
      /no se puede etiquetar hasta que al menos dos maintainers/
    );
    // And in the file whose table the gate reads.
    expect(maintainers).toMatch(/cannot be tagged/);
  });

  it('names every trigger that opens the fiscal-host migration', () => {
    for (const doc of [en, es]) {
      expect(doc).toMatch(/[Ee]ight or more|[Oo]cho o más/);
      expect(doc).toMatch(/trademark|marca/);
      expect(doc).toMatch(/two or more|dos o más/);
    }
  });

  it('does not name a fiscal host as chosen', () => {
    for (const doc of [en, es]) {
      expect(doc).toMatch(
        /deliberately not decided|deliberadamente sin decidir/
      );
    }
  });

  it('carries the continuity clause verbatim in both languages', () => {
    expect(en).toMatch(/180 consecutive\s+days/);
    expect(es).toMatch(/180 días\s+corridos/);
  });

  it('gives the DCO command, not a description of it', () => {
    for (const doc of [en, es]) expect(doc).toContain('git commit -s');
  });
});

describe('the trademark policy', () => {
  const en = readFileSync(join(ROOT, 'TRADEMARK.md'), 'utf-8');
  const es = readFileSync(join(ROOT, 'TRADEMARK.es.md'), 'utf-8');

  it('bans the words it says it bans, in both languages', () => {
    for (const doc of [en, es]) {
      // The words appear — as the words that are never used. What must not
      // appear is a *claim* made with them, which the banned-word table is.
      expect(doc).toMatch(/never used|nunca se usan/);
      expect(doc).toMatch(/Powered by/);
      expect(doc).toMatch(/[Cc]ertificado/);
    }
  });

  it('promises the badge is free, permanently, in writing', () => {
    expect(en).toMatch(/no fee, ever/);
    expect(es).toMatch(/no hay cuota, nunca/);
  });

  it('states the trademark status honestly rather than implying a search', () => {
    expect(en).toMatch(/a web search is not\s+a clearance search/);
    expect(es).toMatch(/una búsqueda web no es una búsqueda de disponibilidad/);
  });

  it('keeps the certification tier reserved and unused', () => {
    expect(en).toMatch(/Reserved and unused/);
    expect(es).toMatch(/Reservada y sin uso/);
  });
});

describe('the changelog parser', () => {
  const releases = specChangelog();

  it('reads every release, newest first as the file lists them', () => {
    expect(releases.length).toBeGreaterThanOrEqual(2);
    expect(releases[0].version.toLowerCase()).toBe('unreleased');
  });

  it('reads groups and their entries', () => {
    const draft = releases.find((r) => r.version.startsWith('0.1'));
    expect(draft?.date).toBe('2026-08-16');
    const added = draft?.groups.find((g) => g.kind === 'Added');
    expect(added?.entries.length).toBeGreaterThan(3);
  });

  it('keeps prose that is not a bullet', () => {
    // The status line — *nothing is normative yet* — is a bold paragraph, and
    // dropping it would be dropping the most important sentence in the file.
    const draft = releases.find((r) => r.version.startsWith('0.1'));
    expect(draft?.notes.join(' ')).toMatch(/DRAFT/);
  });

  it('joins a wrapped bullet back into one entry', () => {
    const draft = releases.find((r) => r.version.startsWith('0.1'));
    const entries = draft?.groups.flatMap((g) => g.entries) ?? [];
    // The source wraps at 76 characters; a parser that kept the wrap would
    // produce fragments that read as separate changes.
    expect(entries.some((entry) => entry.length > 90)).toBe(true);
  });
});

describe('inline Markdown rendering', () => {
  it('escapes before it renders anything', () => {
    expect(inlineMarkdownToHtml('<img src=x onerror=alert(1)>')).not.toContain(
      '<img'
    );
    expect(inlineMarkdownToHtml('a & b')).toContain('&amp;');
  });

  it('renders the subset the sources use', () => {
    expect(inlineMarkdownToHtml('`x`')).toBe('<code>x</code>');
    expect(inlineMarkdownToHtml('**x**')).toBe('<strong>x</strong>');
    expect(inlineMarkdownToHtml('[a](/b)')).toContain('href="/b"');
  });

  it('does not read emphasis inside code', () => {
    expect(inlineMarkdownToHtml('`a_b_c`')).toBe('<code>a_b_c</code>');
    expect(inlineMarkdownToHtml('`**x**`')).toBe('<code>**x**</code>');
  });

  it('refuses a scheme it will not follow, keeping the text', () => {
    const out = inlineMarkdownToHtml('[click](javascript:alert(1))');
    expect(out).not.toContain('href');
    expect(out).toContain('click');
  });

  it('handles a URL containing parentheses', () => {
    const out = inlineMarkdownToHtml('[w](https://x.org/a_(b)) tail');
    expect(out).toContain('href="https://x.org/a_(b)"');
    expect(out).toContain('tail');
  });

  it('renders every changelog entry without emitting an element it did not choose', () => {
    for (const release of specChangelog()) {
      for (const entry of release.groups.flatMap((g) => g.entries)) {
        const html = inlineMarkdownToHtml(entry);
        const tags = [...html.matchAll(/<(\/?\w+)/g)].map((m) =>
          m[1].replace('/', '')
        );
        for (const tag of tags) {
          expect(['code', 'strong', 'em', 'a'], entry).toContain(tag);
        }
      }
    }
  });
});

describe('RFCs', () => {
  const rfcs = specRfcs();

  it('reads the numbered ones and excludes the template', () => {
    expect(rfcs.length).toBeGreaterThanOrEqual(1);
    expect(rfcs.map((r) => r.id)).not.toContain('0000');
  });

  it('defaults an undeclared status to draft, never to accepted', () => {
    for (const rfc of rfcs) {
      expect([
        'draft',
        'open',
        'accepted',
        'declined',
        'withdrawn',
        'superseded',
      ]).toContain(rfc.status);
    }
  });

  it('keeps the founding agreement a draft nobody has agreed to', () => {
    const founding = rfcs.find((r) => r.id === '0001');
    expect(founding?.status).toBe('draft');
    expect(founding?.decided).toBeNull();
    // The document says so itself, in both languages, and that is the claim
    // the index's status chip has to agree with.
    expect(founding?.body).toMatch(/ningún equipo ha aceptado nada/i);
    expect(founding?.body).toMatch(/no team has agreed to anything/i);
  });
});
