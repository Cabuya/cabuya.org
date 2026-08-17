import type { APIRoute, GetStaticPaths } from 'astro';

import { SITE_URL } from '@/lib/constances';
import {
  DEFAULT_LANGUAGE,
  getSupportedLanguages,
  getUrlPrefix,
  type Language,
} from '@/lib/i18n';
import { serializeGenericToMarkdown } from '@/lib/markdown-for-agents';
import type { SpecRfc } from '@/lib/spec-loader';
import { specRfcs } from '@/lib/spec-loader';
import { getTranslations } from '@/lib/translations';

export const getStaticPaths: GetStaticPaths = () => {
  const languages = getSupportedLanguages().filter(
    (lang) => lang !== DEFAULT_LANGUAGE
  );
  return languages.flatMap((lang) =>
    specRfcs().map((rfc) => ({
      params: { lang, number: rfc.id },
      props: { rfc },
    }))
  );
};

export const GET: APIRoute = ({ params, props }) => {
  const lang = params.lang as Language;
  const t = getTranslations(lang);
  const rfc = props.rfc as SpecRfc;

  return new Response(
    serializeGenericToMarkdown({
      title: `RFC-${rfc.id} — ${rfc.title}`,
      description: `${t.rfcs.statusLabels[rfc.status] ?? rfc.status} · ${t.rfcs.tierLabels[rfc.tier] ?? rfc.tier} · ${rfc.title}`,
      lang,
      canonical: `${SITE_URL}${getUrlPrefix(lang)}/rfcs/${rfc.id}`,
      sections: [
        {
          heading: t.rfcs.columnStatus,
          lines: [
            `- **${t.rfcs.columnStatus}**: ${t.rfcs.statusLabels[rfc.status] ?? rfc.status}`,
            `- **${t.rfcs.columnTier}**: ${t.rfcs.tierLabels[rfc.tier] ?? rfc.tier}`,
            `- **${t.rfcs.openedLabel}**: ${rfc.opened || '—'}`,
            `- **${t.rfcs.decidedLabel}**: ${rfc.decided ?? t.rfcs.notDecided}`,
            '',
            t.rfcs.quotedNotice,
          ],
        },
      ],
      body: rfc.body,
    }),
    {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    }
  );
};
