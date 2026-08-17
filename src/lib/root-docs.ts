/**
 * The one adapter for repository-root documents.
 *
 * `GOVERNANCE.md`, `TRADEMARK.md` and `CONTRIBUTING.md` are the source of truth
 * for what this project's governance, badge policy and contribution process
 * *are*. The pages that render them are a second surface on the same text, not
 * a second text.
 *
 * ## Why the files are the source and not the pages
 *
 * Because of who reads which. A developer evaluating whether to adopt this
 * reads `GOVERNANCE.md` on GitHub, in the repository, before they ever visit
 * the site — that is where a governance file is looked for and it is what a
 * fork carries. A page that said something different would be a second set of
 * rules with no way to tell which one binds.
 *
 * Rendering them also makes a promise the project can keep: the page cannot
 * drift, because there is nothing to keep in step. A test asserts the page's
 * content derives from the file's.
 *
 * ## Spanish
 *
 * A `.es.md` sibling, in the same directory, which is the convention GitHub
 * surfaces for translated community files. Two files rather than one file with
 * both languages appended, because a page renders one language and a document
 * containing two would fail the language gate on whichever page it is served
 * to — and, more to the point, because a reader deserves a document rather than
 * half of one.
 *
 * These are repository-root files, not part of either bounded directory, so
 * the boundary rules do not apply. The single adapter is a convention, not a
 * constraint.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Language } from './i18n';
import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  truncateToBand,
} from './meta-description';

const ROOT = process.cwd();

/** Which root documents are rendered as pages. */
export type RootDocId = 'GOVERNANCE' | 'TRADEMARK' | 'CONTRIBUTING';

export interface RootDoc {
  id: RootDocId;
  lang: Language;
  /** The file this came from, relative to the repository root. */
  file: string;
  /** The `# ` heading, which the page uses as its title. */
  title: string;
  /** Everything after the title, unchanged. */
  body: string;
  /** The whole file, for the `.md` twin. */
  raw: string;
}

function fileFor(id: RootDocId, lang: Language): string {
  return lang === 'en' ? `${id}.md` : `${id}.${lang}.md`;
}

/**
 * Read a root document in one language.
 *
 * Throws when the translation is missing rather than falling back to English.
 * A Spanish governance page silently serving English would be a page telling a
 * Spanish-speaking maintainer that the rules were not written for them — and it
 * would pass every automated check that only counts pages.
 */
export function rootDoc(id: RootDocId, lang: Language): RootDoc {
  const file = fileFor(id, lang);
  const path = join(ROOT, file);

  if (!existsSync(path)) {
    throw new Error(
      `${file} does not exist. Every rendered root document needs its ${lang} sibling — a missing translation is a missing file, by design.`
    );
  }

  const raw = readFileSync(path, 'utf-8');
  const match = raw.match(/^#\s+(.+)$/m);

  return {
    id,
    lang,
    file,
    title: match?.[1]?.trim() ?? id,
    // Everything after the title line. The title is rendered by the page's own
    // header, so leaving it in the body would print it twice.
    body: match
      ? raw.slice(raw.indexOf(match[0]) + match[0].length).trim()
      : raw,
    raw,
  };
}

/**
 * A meta description for a root document.
 *
 * Taken from the document's own opening prose rather than written separately,
 * for the same reason the page is: a hand-written description is a second
 * summary that can disagree with the first paragraph it summarises.
 */
export function rootDocSummary(
  doc: RootDoc,
  maxLength = DESCRIPTION_MAX
): string {
  const prose = doc.body
    // Drop the parenthetical language pointer, block quotes, and the "this file
    // is the source" housekeeping — true, and not what the page is about.
    .replace(/^\*\(.*\)\*$/gm, '')
    .replace(/^>.*$/gm, '')
    .replace(/^#.*$/gm, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*`]/g, '')
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, ' ').trim())
    .filter(
      (block) =>
        block.length > 40 &&
        !/^(This file is the source|Este archivo es la fuente)/.test(block)
    );

  let text = '';
  for (const block of prose) {
    text = text ? `${text} ${block}` : block;
    if (text.length >= DESCRIPTION_MIN) break;
  }

  /*
   * Trimmed with the shared helper rather than a local copy, and the reason is
   * the bug the helper already documents: preferring a sentence boundary
   * without a floor cuts a 156-character description back to its 104-character
   * first sentence, which is under the gate's minimum. The Spanish governance
   * page hit exactly that.
   */
  return truncateToBand(text, maxLength, DESCRIPTION_MIN);
}
