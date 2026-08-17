/**
 * The badge: what it says, what colour it says it in, and the SVG itself.
 *
 * A conformance badge is the most-copied and least-read artefact any protocol
 * produces. It ends up in READMEs, in slide decks, in procurement documents —
 * places where nobody will click through, and where whatever it says is taken
 * as the whole truth. So it is built under three constraints that are not
 * negotiable:
 *
 *   1. **The state is text, never colour alone.** A red badge and a green badge
 *      are the same badge to a screen reader, to a monochrome print, and to the
 *      8% of men who cannot reliably separate the two. The word is in the SVG.
 *   2. **The version is always in the name.** «Cabuya 1.0 compatible», never
 *      «Cabuya compatible». An unversioned claim survives the version it was
 *      measured against, which is how a badge becomes a lie by sitting still.
 *   3. **Never the word *certified*.** Nobody certifies anything here. A
 *      validator measured a document at a moment; that is a smaller and more
 *      honest claim, and the badge makes exactly it.
 *
 * The SVG is hand-composed rather than templated by a library because it is
 * served from an edge function with a sub-50ms budget, and because a badge that
 * depends on a package is a badge that changes when the package does.
 *
 * ## Why it links back
 *
 * Every badge links to the publisher's page in the registry, where the run that
 * produced the state is shown with its timestamp and its failing check ids. A
 * badge you cannot audit is decoration; this one is a claim with its evidence
 * one click away — which is also what makes it safe to let anyone embed it.
 */

import type { Language } from './i18n';
import type { BadgeState } from './registry-loader';

/**
 * Badge geometry.
 *
 * Character width is approximated rather than measured — an edge function has
 * no font metrics, and the alternative (shipping a metrics table) costs more
 * than the ragged right edge it would fix. 6.2px per character at 11px Verdana
 * is a shade generous, which errs toward padding rather than clipping.
 */
const CHAR_WIDTH = 6.2;
const PADDING = 9;
const HEIGHT = 20;

/** Where the states sit on the palette. Kept in sync with `global.css` by test. */
const STATE_COLOURS: Record<BadgeState, string> = {
  conforming: '#2F6F4F',
  stale: '#8A6D1F',
  unreachable: '#5B6470',
  failing: '#A33A2E',
  unmeasured: '#5B6470',
  archived: '#4A4F57',
};

/**
 * The right-hand label per state, per language.
 *
 * `stale` says «passing (stale)» rather than a bare «stale» because staleness
 * is information about the feed's freshness, not a verdict on its correctness —
 * a publisher whose data has not changed in a week has not failed anything, and
 * a badge that implies otherwise would push people to touch `last_updated`
 * without touching the data, which is the exact behaviour the field exists to
 * make visible.
 */
export const STATE_LABELS: Record<BadgeState, Record<Language, string>> = {
  conforming: { en: 'compatible', es: 'compatible' },
  stale: { en: 'compatible (stale)', es: 'compatible (desactualizado)' },
  unreachable: { en: 'unreachable', es: 'no alcanzable' },
  failing: { en: 'not passing', es: 'no cumple' },
  unmeasured: { en: 'not yet measured', es: 'aún sin medir' },
  archived: { en: 'archived', es: 'archivado' },
};

/**
 * The badge's claim as a phrase, per state, per language.
 *
 * Only the two passing states get the natural-language form («compatible con
 * Cabuya 1.0»). The rest take the colon form, because Spanish has no reading of
 * «archivado con Cabuya 1.0» that means what the badge means — and a phrase
 * that is grammatical but wrong is worse than one that is merely terse.
 */
const PHRASE: Record<
  BadgeState,
  Record<Language, (subject: string) => string>
> = {
  conforming: {
    en: (s) => `${s} compatible`,
    es: (s) => `compatible con ${s}`,
  },
  stale: {
    en: (s) => `${s} compatible, feed not recently updated`,
    es: (s) => `compatible con ${s}, feed sin actualizar recientemente`,
  },
  unreachable: {
    en: (s) => `${s}: unreachable`,
    es: (s) => `${s}: no alcanzable`,
  },
  failing: {
    en: (s) => `${s}: not passing`,
    es: (s) => `${s}: no cumple`,
  },
  unmeasured: {
    en: (s) => `${s}: not yet measured`,
    es: (s) => `${s}: aún sin medir`,
  },
  archived: {
    en: (s) => `${s}: archived entry`,
    es: (s) => `${s}: entrada archivada`,
  },
};

/**
 * Page tones per state, as Tailwind token pairs.
 *
 * Declared here rather than in the component because two things need them: the
 * server-rendered pill, and the freshness script that swaps a pill when the
 * measurement has moved since the deploy. A second copy of this mapping in the
 * script is a second place for it to drift, and a pill showing `failing` in the
 * green it inherited from `conforming` would be the worst possible bug on this
 * page.
 *
 * `unreachable` is neutral, not an error tone. A host that was down when the
 * cron called has not failed conformance — it was not measured. Painting it the
 * same red as a document with schema errors would punish volunteer
 * infrastructure for having a bad afternoon, and would teach readers to
 * discount the colour when it does mean something.
 */
export const STATE_TONE_CLASSES: Record<BadgeState, string> = {
  conforming: 'bg-cabuya-success-soft text-cabuya-success',
  stale: 'bg-cabuya-warning-soft text-cabuya-warning',
  unreachable: 'bg-cabuya-bg-brand text-cabuya-text-secondary',
  failing: 'bg-cabuya-danger-soft text-cabuya-danger',
  unmeasured: 'bg-cabuya-bg-brand text-cabuya-text-muted',
  archived: 'bg-cabuya-bg-brand text-cabuya-text-muted',
};

/** One sentence per state, for `<title>` and for the publisher page. */
export const STATE_DESCRIPTIONS: Record<
  BadgeState,
  Record<Language, string>
> = {
  conforming: {
    en: 'The last validator run found no errors.',
    es: 'La última ejecución del validador no encontró errores.',
  },
  stale: {
    en: 'The last run found no errors, but the feed has not been updated recently.',
    es: 'La última ejecución no encontró errores, pero el feed no se ha actualizado recientemente.',
  },
  unreachable: {
    en: 'The validator could not fetch the feed on two consecutive runs.',
    es: 'El validador no pudo obtener el feed en dos ejecuciones consecutivas.',
  },
  failing: {
    en: 'The last run found errors. The failing checks are listed on the publisher page.',
    es: 'La última ejecución encontró errores. Las comprobaciones que fallan están listadas en la página del publicador.',
  },
  unmeasured: {
    en: 'Nothing has been measured yet. This entry is listed, not validated.',
    es: 'Todavía no se ha medido nada. Esta entrada está listada, no validada.',
  },
  archived: {
    en: 'This entry was withdrawn. Its identifier is never reassigned.',
    es: 'Esta entrada fue retirada. Su identificador nunca se reasigna.',
  },
};

/**
 * The left-hand cell. Always carries the version, in every language.
 *
 * `Cabuya 1.0` and not `Cabuya`: rule 2 above, and the reason the subject is a
 * function rather than a constant is that the version is a parameter of the
 * measurement, not of the brand.
 */
export function badgeSubject(version: string): string {
  return `Cabuya ${version}`;
}

export interface BadgeOptions {
  state: BadgeState;
  /** Spec version the measurement was made against. */
  version: string;
  lang: Language;
  /** `flat` drops the gradient overlay; the default keeps it. */
  style?: 'flat' | 'default';
  /** Publisher id, for the accessible name. Omitted on a generic badge. */
  publisherId?: string;
}

/**
 * XML-escape. Named `escapeXml` rather than `escape` because the global of that
 * name is a deprecated URL encoder, and a reader who assumed this was it would
 * be wrong about what the SVG contains.
 */
const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * The accessible name, and the same string the `<title>` carries.
 *
 * Read out, it has to stand alone: someone hearing it in a README needs the
 * protocol, the version, the state, and — because the badge is often one of
 * several — which publisher it describes.
 *
 * The two cells read left-to-right in English (`Cabuya 1.0 compatible`), which
 * is the wrong order in Spanish (`compatible con Cabuya 1.0`). The visual cells
 * cannot swap — the version belongs on the dark side in every language, or the
 * badge stops looking like the same badge — so the accessible name is composed
 * in each language's own order instead. Someone listening to it hears a
 * sentence; someone looking at it sees a label pair.
 */
export function badgeAccessibleName(options: BadgeOptions): string {
  const { state, version, lang, publisherId } = options;
  const subject = badgeSubject(version);
  const claim = PHRASE[state][lang](subject);
  return publisherId ? `${publisherId} — ${claim}` : claim;
}

/**
 * Compose the badge.
 *
 * Returns a complete standalone SVG document: it is served as a file and
 * embedded with `<img>`, so it cannot rely on any CSS around it, and any text
 * it wants styled has to carry the style inline.
 */
export function badgeSvg(options: BadgeOptions): string {
  const { state, version, lang, style = 'default' } = options;

  const subject = badgeSubject(version);
  const label = STATE_LABELS[state][lang];
  const colour = STATE_COLOURS[state];

  const subjectWidth = Math.round(subject.length * CHAR_WIDTH) + PADDING * 2;
  const labelWidth = Math.round(label.length * CHAR_WIDTH) + PADDING * 2;
  const total = subjectWidth + labelWidth;

  const name = escapeXml(badgeAccessibleName(options));

  /*
   * The gradient is a 1px-tall linear fill stretched over the badge — the
   * shields.io convention, kept because a badge that looks foreign next to the
   * twenty others in a README reads as unofficial.
   */
  const gradient =
    style === 'flat'
      ? ''
      : `<linearGradient id="g" x2="0" y2="100%"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".1" stop-color="#aaa" stop-opacity=".1"/><stop offset=".9" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>`;

  const overlay =
    style === 'flat'
      ? ''
      : `<rect width="${total}" height="${HEIGHT}" rx="3" fill="url(#g)"/>`;

  /*
   * Text is drawn twice: once in near-black at 25% opacity one pixel lower, as
   * a shadow, then in white. Without it, white-on-mid-green loses legibility
   * when the badge is scaled down in a rendered README.
   */
  const text = (
    content: string,
    centre: number,
    width: number
  ): string => `<text x="${centre * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(width - PADDING * 2) * 10}">${escapeXml(content)}</text>
    <text x="${centre * 10}" y="140" transform="scale(.1)" textLength="${(width - PADDING * 2) * 10}">${escapeXml(content)}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${HEIGHT}" role="img" aria-label="${name}">
  <title>${name}</title>
  ${gradient}
  <clipPath id="c"><rect width="${total}" height="${HEIGHT}" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#c)">
    <rect width="${subjectWidth}" height="${HEIGHT}" fill="#2C3033"/>
    <rect x="${subjectWidth}" width="${labelWidth}" height="${HEIGHT}" fill="${colour}"/>
    ${overlay}
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,DejaVu Sans,Geneva,sans-serif" font-size="110">
    ${text(subject, subjectWidth / 2, subjectWidth)}
    ${text(label, subjectWidth + labelWidth / 2, labelWidth)}
  </g>
</svg>`;
}

/**
 * The copy-paste snippets shown on a publisher's page.
 *
 * Given to adopters ready to paste, with the link already wired to the registry
 * page, because a badge pasted without its link is the failure mode this whole
 * design is trying to avoid — and asking someone to assemble the anchor
 * themselves guarantees a proportion of them will not.
 */
export function badgeEmbedSnippets(
  origin: string,
  publisherId: string,
  lang: Language
): { markdown: string; html: string } {
  const prefix = lang === 'es' ? '/es' : '';
  const page = `${origin}${prefix}/registry/${publisherId}`;
  const image = `${origin}/badge/${publisherId}.svg${lang === 'es' ? '?lang=es' : ''}`;
  const alt =
    lang === 'es'
      ? `Estado de ${publisherId} en el registro de Cabuya`
      : `Cabuya registry status for ${publisherId}`;

  return {
    markdown: `[![${alt}](${image})](${page})`,
    html: `<a href="${page}"><img src="${image}" alt="${alt}" height="20"></a>`,
  };
}
