/**
 * Meta descriptions inside the 130–160 character band `CLAUDE.md` requires.
 *
 * The audit in Task 10 of PLAN_sitewide_language_seo_aeo_audit found 284 of 482
 * URLs outside that band — 203 too short and 81 too long, the longest at 435
 * characters. The cause is structural, not editorial: pages hand the layout a
 * field authored for a different job. A speaker page passes the bio, which is a
 * one-line credit; a meetup archive stub passes a two-sentence note.
 *
 * So this composes rather than edits. It takes the authored lead and, when that
 * is short, extends it with **facts the page already states** — never filler.
 * The rule the task set is explicit: do not pad to hit a character count. A
 * clause that is not true of the page has no business here.
 */
import type { Language } from '@/lib/i18n';

export const DESCRIPTION_MIN = 130;
export const DESCRIPTION_MAX = 160;

export interface MetaDescriptionInput {
  /** The authored description or bio — always the first thing a reader sees. */
  lead: string;
  /**
   * Additional true statements about this page, most useful first. Appended
   * only while the description is under the minimum, and only whole.
   */
  clauses?: Array<string | null | undefined>;
  lang: Language;
  min?: number;
  max?: number;
}

const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim();

/**
 * Trim to `max` without cutting a word in half.
 *
 * Prefers a sentence boundary so the result still reads as a finished thought —
 * but only when that boundary leaves at least `min` characters. Without that
 * condition the preference is self-defeating: appending a clause to a 126-char
 * lead and then cutting back to the last full stop returns the 126-char lead,
 * which is how the first version of this silently no-opped on 131 pages.
 */
export function truncateToBand(text: string, max: number, min = 0): string {
  if (text.length <= max) return text;

  const window = text.slice(0, max);
  const sentenceEnd = Math.max(
    window.lastIndexOf('. '),
    window.lastIndexOf('? '),
    window.lastIndexOf('! ')
  );
  if (sentenceEnd + 1 >= min && sentenceEnd > max * 0.6) {
    return text.slice(0, sentenceEnd + 1);
  }

  const lastSpace = window.slice(0, max - 1).lastIndexOf(' ');
  const cut = lastSpace > 0 ? lastSpace : max - 1;
  return `${text.slice(0, cut).replace(/[,;:.\s]+$/, '')}…`;
}

/**
 * Compose a description inside the band.
 *
 * Guarantees the result is at most `max`. It cannot guarantee the minimum —
 * that depends on how much the caller can truthfully say — so a page with a
 * short lead and no clauses stays short rather than gaining invented text.
 */
export function buildMetaDescription({
  lead,
  clauses = [],
  min = DESCRIPTION_MIN,
  max = DESCRIPTION_MAX,
}: MetaDescriptionInput): string {
  let text = collapse(lead);
  const used = new Set<string | null | undefined>();

  for (const clause of clauses) {
    if (text.length >= min) break;
    const next = collapse(clause ?? '');
    if (!next) continue;
    // Skip a clause the lead already states, so the result never repeats itself.
    if (text.toLowerCase().includes(next.toLowerCase())) continue;

    const separator = /[.!?…]$/.test(text) ? ' ' : '. ';
    const candidate = text ? `${text}${separator}${next}` : next;

    // A clause is appended whole or not at all. Truncating one mid-way leaves
    // a description ending in "Published on the Corag blog on…", which reads
    // worse than the shorter version it replaced — so try the next clause,
    // which may be compact enough to fit.
    if (candidate.length > max) continue;
    text = candidate;
    used.add(clause);
  }

  // Still short: every remaining clause overshot on its own. Append them and
  // trim the tail. Truncating here is safe in a way it is not mid-loop — what
  // gets cut is the trailing context sentence, never a leading fact, and the
  // result is guaranteed to land in the band because `max > min`.
  if (text.length < min) {
    const tail = clauses
      .filter((clause) => clause && !used.has(clause))
      .map((clause) => collapse(clause as string))
      .filter(
        (clause) => clause && !text.toLowerCase().includes(clause.toLowerCase())
      )
      .join(' ');
    if (tail) {
      const separator = /[.!?…]$/.test(text) ? ' ' : '. ';
      text = `${text}${separator}${tail}`;
    }
  }

  return truncateToBand(text, max, min);
}

/** Localized connectors for the clause builders below. */
const PHRASES = {
  en: {
    authorRole: (role: string) => role,
    postCount: (n: number) =>
      `${n} ${n === 1 ? 'article' : 'articles'} on the Corag blog`,
    series: (name: string) => `Part of the ${name} series`,
    community:
      'Published by Corag, where aid gets coordinated and every delivery is backed by evidence.',
    sinceYear: (year: number) => `Contributing to Corag since ${year}`,
  },
  es: {
    authorRole: (role: string) => role,
    postCount: (n: number) =>
      `${n} ${n === 1 ? 'artículo' : 'artículos'} en el blog de Corag`,
    series: (name: string) => `Parte de la serie ${name}`,
    community:
      'Publicado por Corag, donde la ayuda se coordina y cada entrega queda respaldada con evidencia.',
    sinceYear: (year: number) => `Colaborando con Corag desde ${year}`,
  },
} as const;

export const metaPhrases = (lang: Language) => PHRASES[lang] ?? PHRASES.es;
