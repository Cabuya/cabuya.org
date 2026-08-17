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

export const DESCRIPTION_MIN = 130;
export const DESCRIPTION_MAX = 160;

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
