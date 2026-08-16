/**
 * The assertion logic behind `pnpm run md:check:strict`.
 *
 * An earlier parity script reported "480/480 pages (100%)" while the sampled
 * `.md` was missing whole sections the page rendered. It counted files, not
 * content — which is why the defect survived. This covers the layers that
 * replaced it, each with a fixture that must fail.
 */
import { describe, expect, it } from 'vitest';

import {
  bareSlugRows,
  CONTRACT_TARGET,
  contentWords,
  coverageOf,
  evaluatePage,
  floorFor,
  headingsOf,
  MIN_CONTENT_WORDS,
  mainOf,
  missingFrontBlock,
  missingSections,
  navigationProblem,
  pageTypeOf,
} from '../../../scripts/lib/md-completeness.mjs';

const wrapMain = (body: string) =>
  `<html><body><nav>Home Blog Contact</nav><main>${body}</main><footer>Footer chrome</footer></body></html>`;

const GOOD_CONTRIBUTORS_MD = `# Contributors — Corag

> The people building Corag.

Language: en
Canonical: https://cabuya.org/en/contributors

---

Corag is built by a team donating their time.

## Internal team

- [Juan Pérez](/en/contributors) — Engineering

## Contributors

- [Ana Ruiz](/en/contributors) — Mentoring

## Allied communities

- [Pereira Tech Talks](https://pertechtalks.com) — Allied community

## Allied companies

- [DailyBot](https://www.dailybot.com) — Allied company

---

## Site Navigation

- [Home](/en)
`;

describe('page type resolution', () => {
  it.each([
    ['', 'home'],
    ['index', 'home'],
    ['en', 'home'],
    ['blog', 'blog-index'],
    ['blog/some-post', 'blog-post'],
    ['blog/series', 'blog-series-index'],
    ['blog/series/some-series', 'blog-series'],
    ['contributors', 'contributors'],
    ['en/contributors', 'contributors'],
    ['channels', 'channels'],
    ['about', 'about'],
  ])('resolves %s to %s', (path, expected) => {
    expect(pageTypeOf(path)).toBe(expected);
  });

  it('treats the Spanish root and /en as the same type', () => {
    expect(pageTypeOf('index')).toBe(pageTypeOf('en'));
  });
});

describe('content-word coverage', () => {
  it('ignores nav and footer chrome by scoping to <main>', () => {
    const html = wrapMain('<p>Quality engineering practice</p>');
    expect(mainOf(html)).not.toContain('Footer chrome');
    const { ratio } = coverageOf(html, 'Quality engineering practice');
    expect(ratio).toBe(1);
  });

  it('reports which words the twin is missing', () => {
    const html = wrapMain('<p>alpha bravo charlie delta</p>');
    const { missing, ratio } = coverageOf(html, 'alpha bravo');
    expect(missing.sort()).toEqual(['charlie', 'delta']);
    expect(ratio).toBeCloseTo(0.5, 5);
  });

  it('cannot be inflated by link targets', () => {
    const html = wrapMain('<p>procedural generation discovery</p>');
    const padded = '[x](/procedural/generation/discovery)';
    expect(coverageOf(html, padded).ratio).toBeLessThan(1);
  });

  it('compares words as a set, so reordering is allowed', () => {
    const html = wrapMain('<p>alpha bravo charlie</p>');
    expect(coverageOf(html, 'charlie bravo alpha').ratio).toBe(1);
  });

  it('folds diacritics so accents do not read as a miss', () => {
    expect(contentWords('Tecnología')).toEqual(contentWords('tecnologia'));
  });
});

describe('required sections', () => {
  it('passes a complete contributors twin', () => {
    expect(missingSections(GOOD_CONTRIBUTORS_MD, 'contributors')).toEqual([]);
  });

  it('FIXTURE: fails when the Internal team section is dropped', () => {
    const broken = GOOD_CONTRIBUTORS_MD.replace(
      '## Internal team',
      '## Something else'
    );
    expect(missingSections(broken, 'contributors')).toEqual(['Internal team']);
  });

  it('accepts the Spanish heading for the same section', () => {
    const spanish = GOOD_CONTRIBUTORS_MD.replace(
      '## Internal team',
      '## Equipo interno'
    );
    expect(missingSections(spanish, 'contributors')).toEqual([]);
  });

  it('requires Contributors only when the HTML exposes that section', () => {
    const withoutCollaboratorsHeading = GOOD_CONTRIBUTORS_MD.replace(
      '## Contributors\n\n- [Ana Ruiz](/en/contributors) — Mentoring\n\n',
      ''
    );
    expect(
      missingSections(
        withoutCollaboratorsHeading,
        'contributors',
        '<main></main>'
      )
    ).toEqual([]);
    expect(
      missingSections(
        withoutCollaboratorsHeading,
        'contributors',
        '<main><section id="collaborators"></section></main>'
      )
    ).toEqual(['Contributors']);
  });

  it('reads both h2 and h3 headings', () => {
    expect(headingsOf('## Alpha\n\n### Bravo\n')).toEqual(['Alpha', 'Bravo']);
  });
});

describe('universal rules', () => {
  it('accepts a well-formed front block', () => {
    expect(missingFrontBlock(GOOD_CONTRIBUTORS_MD)).toEqual([]);
  });

  it.each([
    ['H1 title', GOOD_CONTRIBUTORS_MD.replace('# Contributors — Corag', 'C')],
    ['Language:', GOOD_CONTRIBUTORS_MD.replace('Language: en', '')],
    ['Canonical:', GOOD_CONTRIBUTORS_MD.replace(/^Canonical:.*$/m, '')],
  ])('FIXTURE: reports a missing %s', (field, broken) => {
    expect(missingFrontBlock(broken)).toContain(field);
  });

  it('accepts exactly one Site Navigation block', () => {
    expect(navigationProblem(GOOD_CONTRIBUTORS_MD)).toBeNull();
  });

  it('FIXTURE: reports a missing Site Navigation block', () => {
    const broken = GOOD_CONTRIBUTORS_MD.replace(
      '## Site Navigation',
      '## Links'
    );
    expect(navigationProblem(broken)).toMatch(/missing/);
  });

  it('FIXTURE: reports a duplicated Site Navigation block', () => {
    const broken = `${GOOD_CONTRIBUTORS_MD}\n## Site Navigation\n`;
    expect(navigationProblem(broken)).toMatch(/2 times/);
  });

  it('accepts the Spanish navigation heading', () => {
    const spanish = GOOD_CONTRIBUTORS_MD.replace(
      '## Site Navigation',
      '## Navegación del Sitio'
    );
    expect(navigationProblem(spanish)).toBeNull();
  });

  it('FIXTURE: catches a bare slug row where a name belongs', () => {
    const broken = `${GOOD_CONTRIBUTORS_MD}\n- como-donar-sin-caer-en-estafas\n`;
    expect(bareSlugRows(broken)).toEqual(['- como-donar-sin-caer-en-estafas']);
  });

  it('does not mistake a linked entity row for a bare slug', () => {
    const fine = '- [Juan Pérez](/en/contributors) — Engineering';
    expect(bareSlugRows(fine)).toEqual([]);
  });
});

describe('thresholds', () => {
  it('holds unlisted types to the contract target', () => {
    expect(floorFor('about')).toBe(CONTRACT_TARGET);
    expect(floorFor('blog-post')).toBe(CONTRACT_TARGET);
  });

  it('gives the documented types a measured floor below the target', () => {
    for (const type of ['home', 'contact']) {
      expect(floorFor(type)).toBeLessThan(CONTRACT_TARGET);
      // A floor is a regression detector, not an amnesty.
      expect(floorFor(type)).toBeGreaterThanOrEqual(0.7);
    }
  });
});

describe('evaluatePage', () => {
  const html = wrapMain(
    `<h1>Contributors — Corag</h1>
     <p>Corag is built by a team donating their time.</p>
     <h2>Internal team</h2>
     <p>Juan Pérez Engineering</p>
     <section id="collaborators"><h2>Contributors</h2>
     <p>Ana Ruiz Mentoring</p></section>
     <h2>Allied communities</h2>
     <p>Pereira Tech Talks Allied community</p>
     <h2>Allied companies</h2>
     <p>DailyBot Allied company</p>`
  );

  it('passes a complete twin', () => {
    const verdict = evaluatePage({
      pagePath: 'en/contributors',
      html,
      markdown: GOOD_CONTRIBUTORS_MD,
      expectedLanguage: 'en',
    });
    expect(verdict.errors).toEqual([]);
    expect(verdict.type).toBe('contributors');
  });

  it('FIXTURE: fails a twin that declares the wrong language', () => {
    const broken = GOOD_CONTRIBUTORS_MD.replace('Language: en', 'Language: es');
    const verdict = evaluatePage({
      pagePath: 'en/contributors',
      html,
      markdown: broken,
      expectedLanguage: 'en',
    });
    expect(verdict.errors.join(' ')).toMatch(/language other than "en"/);
  });

  it('FIXTURE: fails a summary and names what is absent', () => {
    const summary = `# Contributors — Corag

Language: en
Canonical: https://cabuya.org/en/contributors

---

## Past contributors

None yet.

## Site Navigation

- [Home](/en)
`;
    const verdict = evaluatePage({
      pagePath: 'en/contributors',
      html,
      markdown: summary,
      expectedLanguage: 'en',
    });
    expect(verdict.errors.join(' ')).toMatch(/missing required section/);
  });

  it('skips the ratio below the page-size floor but keeps section checks', () => {
    const tiny = wrapMain('<p>alpha bravo charlie</p>');
    const verdict = evaluatePage({
      pagePath: 'en/about',
      html: tiny,
      markdown:
        '# A\n\nLanguage: en\nCanonical: https://x.test/a\n\n## Site Navigation\n',
      expectedLanguage: 'en',
    });
    expect(verdict.measured).toBe(false);
    expect(verdict.htmlWordCount).toBeLessThan(MIN_CONTENT_WORDS);
    expect(verdict.errors).toEqual([]);
  });
});
