import type { APIRoute } from 'astro';
import { getChannels } from '@/lib/channel';
import { SITE_URL } from '@/lib/constances';
import {
  entityLine,
  resolveI18n,
  serializeGenericToMarkdown,
} from '@/lib/markdown-for-agents';

export const GET: APIRoute = async () => {
  const lang = 'es';
  const channels = await getChannels();
  const primary = channels.filter((c) => c.data.isPrimary);
  const secondary = channels.filter((c) => !c.data.isPrimary);

  // The HTML shows each channel's audience alongside its description, and
  // marks the recommended starting point. A description-only row lost both.
  const renderChannel = (c: (typeof channels)[number]) =>
    entityLine(
      c.data.name,
      c.data.url,
      c.data.platform,
      resolveI18n(c.data.description, lang),
      resolveI18n(c.data.audience, lang)
    );

  const sections = [
    {
      heading: 'Donde ocurre todo',
      lines: primary.map(renderChannel),
    },
    {
      heading: 'Canales de la red',
      lines: secondary.map(renderChannel),
    },
  ];

  const markdown = serializeGenericToMarkdown({
    title: 'Canales — Corag',
    description:
      'Los canales oficiales de Corag: la aplicación, el grupo de WhatsApp, Instagram y Facebook, con una indicación clara de por dónde empezar.',
    lang,
    canonical: `${SITE_URL}/channels`,
    metadata: [['Total de canales', String(channels.length)]],
    sections,
  });

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
