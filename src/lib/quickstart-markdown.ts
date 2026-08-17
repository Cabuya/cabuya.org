/**
 * The quickstart's Markdown twin.
 *
 * The twin matters more here than on any other page: an agent asked to "publish
 * a Cabuya feed" will fetch this, and what it reads has to be enough to do the
 * job. So the twin carries the two JSON documents in full — not a link to them
 * — and the per-stack notes as a list rather than as tabs it cannot click.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  CORS_RECIPES,
  DENY_KEYS,
  DENY_PATTERNS,
  SPA_EXCLUSIONS,
} from '@cabuya/validator';

import type { Language } from '@/lib/i18n';
import { diagramLines } from '@/lib/markdown-for-agents';
import { getTranslations } from '@/lib/translations';

export interface TwinSection {
  heading: string;
  lines: string[];
}

const FIXTURES = join(process.cwd(), 'tests', 'fixtures', 'quickstart');
const read = (name: string) =>
  readFileSync(join(FIXTURES, name), 'utf-8').trim();

export function quickstartSections(lang: Language): TwinSection[] {
  const t = getTranslations(lang);

  return [
    {
      heading: t.quickstart.agentPathTitle,
      lines: [
        t.quickstart.lead,
        '',
        t.quickstart.agentPathBody,
        ...diagramLines('quickstartPath', lang),
      ],
    },
    {
      heading: t.quickstart.fileFirstTitle,
      lines: [
        t.quickstart.fileFirstBody,
        '',
        '```json',
        read('manifest.json'),
        '```',
      ],
    },
    {
      heading: t.quickstart.title,
      lines: [
        `**${t.quickstart.handPathTitle}** — ${t.quickstart.handPathBody}`,
        '',
        ...t.quickstart.steps.map(
          (step, index) => `${index + 1}. **${step.title}** — ${step.body}`
        ),
      ],
    },
    {
      heading: 'places.json',
      lines: ['```json', read('feed.json'), '```'],
    },
    {
      heading: t.quickstart.spaTitle,
      lines: [
        t.quickstart.spaLead,
        '',
        t.quickstart.spaWhy,
        '',
        ...SPA_EXCLUSIONS.map(
          (entry) =>
            `- **${entry.label}** — ${entry.note[lang] ?? entry.note.en}${
              entry.path ? ` (\`${entry.path}\`)` : ''
            }`
        ),
      ],
    },
    {
      heading: t.quickstart.corsTitle,
      lines: [
        t.quickstart.corsLead,
        '',
        `> ${t.quickstart.corsWhy}`,
        '',
        ...CORS_RECIPES.flatMap((recipe) => [
          `**${recipe.label}**${recipe.file ? ` — \`${recipe.file}\`` : ''}`,
          '',
          recipe.note[lang] ?? recipe.note.en,
          ...(recipe.snippet ? ['', '```', recipe.snippet, '```'] : []),
          '',
        ]),
      ],
    },
    {
      heading: t.quickstart.piiTitle,
      lines: [
        t.quickstart.piiLead,
        '',
        `${t.quickstart.piiKeysLabel}: ${DENY_KEYS.join(', ')}.`,
        '',
        `${t.quickstart.piiPatternsLabel}: ${DENY_PATTERNS.map((pattern) => pattern.class).join(', ')}.`,
        '',
        t.quickstart.piiConfirm,
      ],
    },
    {
      heading: t.quickstart.validatorTitle,
      lines: [
        t.quickstart.validatorLead,
        '',
        '```sh',
        'npx @cabuya/validator validate https://example.org/.well-known/cabuya.json',
        '```',
        '',
        t.quickstart.validatorPending,
      ],
    },
    {
      heading: t.quickstart.honestyTitle,
      lines: [t.quickstart.honestyBody, '', t.quickstart.honestyAfternoon],
    },
  ];
}
