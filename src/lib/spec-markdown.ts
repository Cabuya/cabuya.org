/**
 * Markdown twins for the specification and schema pages.
 *
 * The spec twin is the special case in the whole twin system: the source file
 * **is** the twin. A specification section is already Markdown, already
 * normative, already the thing the validator and the skill read — serializing
 * a rendered copy of it would produce a second version of a normative document,
 * which is precisely what versioned URLs exist to prevent.
 *
 * So these twins serve the raw file with a short front block, byte for byte
 * after the frontmatter. An agent that fetches `.md` gets the specification,
 * not a description of it.
 */
import { SITE_URL } from '@/lib/constances';
import { checksForField } from '@/lib/field-checks';
import type { Language } from '@/lib/i18n';
import { getUrlPrefix } from '@/lib/i18n';
import { siteNavigationBlock } from '@/lib/markdown-for-agents';
import { exampleValueFor, schemaFields } from '@/lib/schema-reference';
import {
  type SpecSchema,
  type SpecSection,
  schemaDescriptions,
  specExamples,
} from '@/lib/spec-loader';
import { getTranslations } from '@/lib/translations';

/**
 * A spec section's twin: a front block, then the source file unchanged.
 *
 * The Spanish route serves the same English body with the notice above it —
 * the same asymmetry the HTML page carries, and for the same reason.
 */
export function specSectionMarkdown(
  section: SpecSection,
  lang: Language
): string {
  const t = getTranslations(lang);
  const prefix = getUrlPrefix(lang);
  const canonical = `${SITE_URL}${prefix}/developers/spec/${section.version}/${section.slug}`;

  const front = [
    `# §${section.number} — ${section.title}`,
    '',
    `Cabuya ${section.version} · ${t.spec.statusLabels[section.status] ?? section.status}`,
    '',
    `Canonical: ${canonical}`,
    /*
     * The twin declares the language of its *route*, not of its body. The two
     * differ here by design, and the notice below is what reconciles them —
     * declaring `en` on a `/es` URL would just make the twin wrong about which
     * page it is.
     */
    `Language: ${lang}`,
    '',
  ];

  if (lang !== 'en') {
    front.push(`> ${t.spec.normativeLanguageNotice}`, '');
  }

  front.push('---', '');

  /*
   * The normative body stays contiguous and byte-exact. The navigation block
   * the twin contract requires is appended *below* a horizontal rule, outside
   * the document — an agent gets the specification first, and the map after.
   */
  return [
    front.join('\n'),
    section.body.trimEnd(),
    '',
    '---',
    '',
    ...siteNavigationBlock(lang),
    '',
  ].join('\n');
}

/** A schema page's twin: the generated table, as a Markdown table. */
export function schemaMarkdown(schema: SpecSchema, lang: Language): string {
  const t = getTranslations(lang);
  const prefix = getUrlPrefix(lang);
  const fields = schemaFields(schema.schema, { lang }).map((field) => ({
    ...field,
    description:
      schemaDescriptions(schema.version, lang)[schema.name]?.[field.path] ??
      field.description,
  }));

  const example = (() => {
    const source = specExamples(schema.version).find(
      (entry) => entry.kind === 'valid' && entry.name.includes('rich')
    );
    try {
      return source ? JSON.parse(source.raw) : undefined;
    } catch {
      return undefined;
    }
  })();

  const rows = fields.map((field) => {
    const checks = checksForField(field.path);
    const value = example ? exampleValueFor(example, field.path) : undefined;
    return `| \`${field.path}\` | \`${field.type}\` | ${
      field.required ? t.docs.yes : t.docs.no
    } | ${field.profile === 'core' ? t.spec.coreLabel : t.spec.extendedLabel} | ${
      value ? `\`${value}\`` : '—'
    } | ${checks.length > 0 ? checks.join(', ') : '—'} | ${(
      field.description ?? ''
    ).replace(/\|/g, '\\|')} |`;
  });

  const lines = [
    `# ${schema.title ?? schema.name}`,
    '',
    schema.description ?? t.spec.schemasDescription,
    '',
    `Canonical: ${SITE_URL}${prefix}/developers/schemas/${schema.version}/${schema.name}`,
    `Language: ${lang}`,
    '',
    `${t.spec.schemaIdLabel}: ${schema.id}`,
    '',
    /*
     * The field descriptions come from the schema, which is English by the
     * same rule the specification follows. The notice says so, and the
     * language gates key their exemption on its presence.
     */
    ...(lang === 'en' ? [] : [`> ${t.spec.normativeLanguageNotice}`, '']),
    `## ${t.spec.fieldsTitle}`,
    '',
    `| ${t.docs.field} | ${t.docs.type} | ${t.docs.required} | ${t.spec.profileColumn} | ${t.spec.exampleColumn} | ${t.spec.checksColumn} | ${t.docs.description} |`,
    '|---|---|---|---|---|---|---|',
    ...rows,
    '',
    `## ${t.spec.examplesTitle}`,
    '',
    t.spec.examplesLead,
    '',
  ];

  for (const entry of specExamples(schema.version)) {
    lines.push(
      `### ${entry.name}.json — ${
        entry.kind === 'valid' ? t.spec.validLabel : t.spec.invalidLabel
      }`,
      ''
    );
    if (entry.comment) {
      lines.push(`> **${t.spec.teachingNote}:** ${entry.comment}`, '');
    }
    lines.push('```json', entry.raw.trimEnd(), '```', '');
  }

  lines.push(...siteNavigationBlock(lang), '');
  return lines.join('\n');
}

/** The spec index twin: the versions, and the two rules that govern them. */
export function specIndexMarkdown(
  lang: Language,
  versions: Array<{ version: string; status: string; sections: number }>
): string {
  const t = getTranslations(lang);
  const prefix = getUrlPrefix(lang);
  return [
    `# ${t.spec.indexTitle}`,
    '',
    t.spec.indexDescription,
    '',
    `Canonical: ${SITE_URL}${prefix}/developers/spec`,
    `Language: ${lang}`,
    '',
    t.spec.indexLead,
    '',
    ...versions.map(
      (entry) =>
        `- [${t.spec.versionLabel} ${entry.version}](${SITE_URL}${prefix}/developers/spec/${entry.version}) — ${
          t.spec.statusLabels[entry.status] ?? entry.status
        }, ${entry.sections} ${t.spec.sectionsCountLabel}`
    ),
    '',
    `## ${t.spec.permanenceTitle}`,
    '',
    t.spec.permanenceBody,
    '',
    `## ${t.spec.rcRuleTitle}`,
    '',
    t.spec.rcRuleBody,
    '',
    ...siteNavigationBlock(lang),
    '',
  ].join('\n');
}

/** A version's table of contents, as Markdown. */
export function specVersionMarkdown(
  lang: Language,
  version: string,
  status: string,
  sections: SpecSection[]
): string {
  const t = getTranslations(lang);
  const prefix = getUrlPrefix(lang);
  return [
    `# ${t.spec.indexTitle} ${version}`,
    '',
    `${t.spec.statusLabels[status] ?? status}. ${t.spec.indexDescription}`,
    '',
    `Canonical: ${SITE_URL}${prefix}/developers/spec/${version}`,
    `Language: ${lang}`,
    '',
    ...(lang === 'en' ? [] : [`> ${t.spec.normativeLanguageNotice}`, '']),
    `## ${t.spec.sectionsTitle}`,
    '',
    ...sections.map(
      (section) =>
        `- §${section.number} [${section.title}](${SITE_URL}${prefix}/developers/spec/${version}/${section.slug})`
    ),
    '',
    t.spec.permanenceBody,
    '',
    ...siteNavigationBlock(lang),
    '',
  ].join('\n');
}

/** The schema index twin. */
export function schemaIndexMarkdown(
  lang: Language,
  entries: Array<{ version: string; schemas: SpecSchema[] }>
): string {
  const t = getTranslations(lang);
  const prefix = getUrlPrefix(lang);
  const lines = [
    `# ${t.spec.schemasTitle}`,
    '',
    t.spec.schemasDescription,
    '',
    `Canonical: ${SITE_URL}${prefix}/developers/schemas`,
    `Language: ${lang}`,
    '',
    t.spec.schemasLead,
    '',
  ];
  for (const entry of entries) {
    lines.push(`## ${t.spec.versionLabel} ${entry.version}`, '');
    for (const schema of entry.schemas) {
      lines.push(
        `- [${schema.title ?? schema.name}](${SITE_URL}${prefix}/developers/schemas/${entry.version}/${schema.name}) — \`${schema.id}\``
      );
      if (schema.description) lines.push(`  ${schema.description}`);
    }
    lines.push('');
  }
  lines.push(...siteNavigationBlock(lang), '');
  return lines.join('\n');
}
