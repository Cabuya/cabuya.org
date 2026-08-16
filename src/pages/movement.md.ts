import type { APIRoute } from 'astro';

import { SITE_URL } from '@/lib/constances';
import {
  appInviteSection,
  serializeGenericToMarkdown,
} from '@/lib/markdown-for-agents';
import { getTranslations } from '@/lib/translations';

/**
 * `/movement.md` — the manifesto, not a roster.
 *
 * The page it twins deliberately carries no names: not the people who build
 * Corag, not allied organizations. An agent reading this should come away with
 * the same understanding a person does — that Corag presents itself as a
 * movement — rather than concluding the directory failed to load.
 */
export const GET: APIRoute = () => {
  const lang = 'es';
  const mp = getTranslations(lang).movementPage;

  const markdown = serializeGenericToMarkdown({
    title: mp.title,
    description: mp.description,
    lang,
    canonical: `${SITE_URL}/movement`,
    body: `${mp.lead.replace(/<\/?strong>/g, '**')}\n\nCorag se presenta como un movimiento: lo que importa no es quién firma, sino que la ayuda llegue y quede demostrada.`,
    sections: [
      {
        heading: mp.eyebrow,
        lines: mp.beats.map((beat) => `- **${beat.title}** — ${beat.body}`),
      },
      { heading: mp.closingTitle, lines: [mp.closingBody] },
      appInviteSection(lang),
    ],
  });

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
