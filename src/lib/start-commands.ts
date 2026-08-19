/**
 * The commands `/start` teaches, as data.
 *
 * One module so the page, its Markdown twin and the test pin the same
 * strings. The values are the ones proven on a clean machine in the pack's
 * 0.1.0 release (its INSTALL_TRANSCRIPT); `start-commands.test.ts` fails if
 * an edit here drifts from that proof, which is the point — this page quotes
 * installs, it does not aspire to them.
 */

import { SKILL_REPO_URL } from '@/lib/site-navigation';

export const START_COMMANDS = {
  /** The skills-CLI path: snapshot into `.agents/skills/`, agents symlinked. */
  install: 'npx skills add Cabuya/cabuya-skill',
  /**
   * The vendored path: reviewable in a pull request, pinned, offline. The
   * pack lives at skills/cabuya inside its repo (the family layout), so a
   * bare clone into an agent's skills directory is no longer itself a
   * skill — setup.sh links the pack into every agent it detects, and was
   * proven doing so on a clean machine after the restructure.
   */
  installVendored: `git clone --depth 1 ${SKILL_REPO_URL} vendor/cabuya-skill && bash vendor/cabuya-skill/setup.sh`,
  /** The sentence. The pack routes it to its adopt sub-skill. */
  invoke: '/cabuya',
} as const;
