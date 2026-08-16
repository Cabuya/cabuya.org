# Content QA Checklist

Agent-facing gates before shipping content or closing a content DWP.

## Bilingual parity

- [ ] Blog posts and page twins: ES and EN files exist under
      `src/content/{blog,pages}/{es,en}/`, sharing the same English slug and
      the same date prefix
- [ ] The English title is real English, not the Spanish title with a word
      swapped
- [ ] Each body speaks one language — a Spanish body writes `## Sigue leyendo`
      and `por`, an English body `## Keep reading` and `by`
- [ ] YAML entities (`authors`, `channels`, `contributors`): `en`/`es` fields
      filled — no Spanish pasted into `en`

## Content parity — same content, not just the same language

Being in the right language is [language integrity](#language-integrity). This
is the separate question of whether the two versions say the **same thing**.

- [ ] Every URL in one body exists in the other — no source reaches only one
      set of readers
- [ ] Same structure: same headings, list items and paragraph breaks, and the
      `---` rule before the Sources block in both
- [ ] Real paragraph breaks, not soft line breaks — a single newline renders as
      a space, so `**Ponente:** Ana\n**Rol:** CTO` runs together on one line
- [ ] Every external link verified to resolve **to what it claims** — a URL
      returning 200 may still point at something else entirely
- [ ] Every figure in the body is one we can back. An unverifiable statistic is
      a liability the moment somebody checks it, and on this site especially
- [ ] `pnpm run parity:check` reports 0 `content-loss` and 0 `structural`

## Orthography

- [ ] Spanish user-facing text uses ñ and accented vowels
- [ ] Run Standards greps from [STANDARDS](../STANDARDS.md) (ignore English **slugs**)

## Voice & completeness

- [ ] No placeholders: `[TODO]`, `[TBD]`, `[AUTHOR]`, or filler boilerplate
- [ ] Follow [Writing Voice Guide](../WRITING_VOICE_GUIDE.md)
- [ ] No CTA promising a channel we do not run. Social is Facebook, Instagram
      and the WhatsApp group — nothing else

## Language integrity

- [ ] `pnpm run lang:check` reports **0 flagged pages** — Spanish URLs render
      Spanish, English URLs render English, in HTML *and* in the `.md` twin
- [ ] A page flagged as a **false positive** is fixed in the classifier, not
      allowlisted. All three known false positives turned out to be classifier
      bugs (see `src/lib/language-detect.ts`)

## `.md` completeness

- [ ] `pnpm run md:check` passes — every page has a **complete** twin, not a
      summary. It asserts required sections per page type, no bare-slug rows, a
      well-formed front block, one Site Navigation block, and content coverage
- [ ] Entity references carry a name **and** a link to that entity's own `.md`
- [ ] Agent MD twins updated under `src/content/pages/{en,es}/` when page copy
      changes — unless the page's twin is generated from the same source the
      HTML renders (the institutional pages, the blog index, contact), in which
      case it follows automatically
- [ ] For `conduct`, `governance` and `contributing`, remember the content file
      **is** the page body. Editing it changes the live site

## SEO / AEO

- [ ] `pnpm run seo:check` reports **0 flagged URLs**
- [ ] Meta descriptions land in **130–160 characters**. Prefer extending
      `buildMetaDescription`'s clauses with true facts over rewriting copy —
      and never pad to hit the count

## Automated

```bash
pnpm run test                 # includes the bilingual-parity and body-selection suites
pnpm run biome:check
pnpm run astro:check
pnpm run build                # the three gates below read dist/
pnpm run md:check             # completeness + language of every .md twin
pnpm run lang:check           # sitewide language integrity
pnpm run seo:check            # per-URL SEO and structured data
pnpm run parity:check         # ES/EN carry the same content (reads src/content/)
```

Each has a `:strict` variant that exits non-zero; all four run in CI after the
build (`.github/workflows/code_check.yml`). `parity:check` is the exception that
reads `src/content/` rather than `dist/` — parity is a property of the authored
files, so it can be caught before a build.
