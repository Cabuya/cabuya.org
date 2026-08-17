/**
 * Which share card a page gets.
 *
 * Resolution order, most specific first:
 *
 *   1. An explicit `image` prop on the page's layout — one page, one card.
 *   2. A section card matched by route prefix.
 *   3. The default card for the language.
 *
 * ## Why route prefixes and not frontmatter
 *
 * A section card is a property of a *section*, and sections are URL prefixes.
 * Putting it in frontmatter means every new page in that section has to
 * remember to set it, and the one that forgets is the one that gets shared.
 * The prefix map is declared once and applies to pages nobody has written yet.
 *
 * ## Why there is only one card today
 *
 * `docs/visuals/prompts/04-og-images.md` defers per-section artwork until
 * analytics shows people link directly to a section. The mechanism ships now
 * because retrofitting it later means touching every layout; the artwork does
 * not, because five cards is five things to keep consistent for a benefit
 * nobody has measured yet.
 */
import { DEFAULT_OG_IMAGE_EN, DEFAULT_OG_IMAGE_ES } from '@/lib/constances';
import type { Language } from '@/lib/i18n';

export interface OgCard {
  /** Site-root-relative path to the image. */
  path: string;
  width: number;
  height: number;
}

/** Every card the site can serve, by id. */
export const OG_CARDS: Record<string, OgCard> = {
  'default-en': { path: DEFAULT_OG_IMAGE_EN, width: 1200, height: 630 },
  'default-es': { path: DEFAULT_OG_IMAGE_ES, width: 1200, height: 630 },
};

/**
 * Section cards by route prefix, longest match first.
 *
 * Empty today, and the emptiness is the point — see the header comment. To add
 * one: generate the artwork per the prompt pack, register it in `OG_CARDS`, and
 * add a prefix here. Nothing else changes.
 */
export const SECTION_CARDS: Array<{ prefix: string; card: string }> = [];

/** Strip the language prefix so one rule covers both languages. */
function bareRoute(pathname: string): string {
  const bare = pathname.replace(/^\/es(?=\/|$)/, '') || '/';
  return bare.length > 1 ? bare.replace(/\/$/, '') : '/';
}

export function resolveOgImage(
  pathname: string,
  lang: Language,
  explicit?: string
): OgCard {
  if (explicit) {
    // A page that names its own card knows its dimensions too — but every card
    // this project ships is 1200×630, and a differently sized one would break
    // the crop guidance in the prompt pack.
    return { path: explicit, width: 1200, height: 630 };
  }

  const route = bareRoute(pathname);
  const match = [...SECTION_CARDS]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find(
      (entry) => route === entry.prefix || route.startsWith(`${entry.prefix}/`)
    );
  if (match && OG_CARDS[match.card]) return OG_CARDS[match.card];

  return lang === 'en' ? OG_CARDS['default-en'] : OG_CARDS['default-es'];
}
