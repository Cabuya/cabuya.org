# AI Diff Reviewer — repo extension for `cabuya.org`

> Layered on the shipped default review prompt. Anchors severity to this repo's
> real conventions: Astro 7 SSG + Sätteri Markdown + Svelte 5 islands + TS 6
> (pinned) + Tailwind 4 `@theme` **cabuya** tokens + Biome 2, pnpm workspaces,
> bilingual **EN at `/`, ES at `/es`** (D-W1), Cloudflare Pages + Functions + KV.
>
> Rewritten in the Task 50 security review: the previous version described the
> Corag site it was written for — `--color-corag-*`, ES at root and EN at
> `/en`, channels this project does not run. A reviewer anchored to the wrong
> conventions is worse than none: it flags correct code and passes real
> violations.

## What this project is, in one line

An open interoperability standard for emergency-aid applications, whose
central argument is that **a conformance claim nobody measured is worth
nothing**. Most of the severity below follows from that, applied to ourselves.

## Always `critical`

**Rule 0 — a claim the repository cannot back.**
A figure without a named source; an organisation named as trustworthy; a link
or CTA to an endpoint, page or channel that does not exist. This is the
project's founding argument and the review's first duty. The launch dry run
found a published OpenAPI advertising five endpoints that had been deleted —
that class of defect, in a repository arguing that manifests lie.

**Conformance language the validator has not measured.**
"Conforming", "compliant", "verified" or a level (`L0`–`L4`) asserted about a
publisher without a measurement behind it. **The word *certified* / *certificado*
is banned outright** except where the text is explaining that it is never used.
Degraded and offline runs say exactly *"schema-valid; conformance unmeasured"*.

**Person-level data, anywhere.**
A personal name, phone, email, document number, home address or photo — in
code, content, fixtures, examples, tests or docs. Org-level role addresses
published by their own organisation are the only exception. Sample data uses
the `.invalid` TLD. The one deliberate exception is
`spec/examples/0.1/invalid/invalid-2-*.json`, whose purpose is to teach the
rule and whose data is transparently fictional.

**A contact value in a feed, a schema or an example** — including inside a
namespaced `x_*` extension. Namespacing is for fields the vocabulary lacks,
not an exemption from §7.2.

**`updated_at` mapped into `last_confirmed_at`** (CR-1), in any code, template,
guide or example. An edit is not a confirmation, and this is the most tempting
shortcut in the whole protocol: almost every app has the first and almost none
has the second. `null` is the conforming, honest value.

**`last_updated` generated per request** (BEH002). A feed that always reads
fresh makes a stalled pipeline indistinguishable from a healthy one — worse
than no timestamp, because a missing one is detectable.

**Hand-editing `spec/` or `examples/` in the skill repo**, or any change to
`spec/` here that does not go through an RFC. `sync-spec.sh` is the only writer;
`verify-integrity.sh` is the gate.

**A design token declared outside `src/styles/global.css`** — including an
inline `style="--color-cabuya-…"`. Declared once, read everywhere.

**A new top-level route with no `src/middleware.ts` entry.** The allowlist
returns 404 in production; the page works in dev. A silent production break.

**A secret reachable by the client.** `DAILYBOT_API_KEY`, `CF_KV_*` and any
token must stay in the Function environment — never `PUBLIC_*`, never a
fixture, never a doc.

**remark/rehype reintroduced.** This repo compiles Markdown with **Sätteri**
(`markdown.processor: satteri({ hastPlugins: [...] })`). Adding
`remarkPlugins` / `rehypePlugins` or a `remark-*` / `rehype-*` / `unist-*`
dependency means the transform **silently never runs**. Port it to a HAST
plugin in `src/lib/satteri-plugins.ts`.

**Placeholder content shipped** — `[TODO:`, `[TBD]`, `[AUTHOR:`, `[FIXME]` in
`src/content/**`, `spec/**`, `registry/**` or any published document.

**Content added in one language only.** A page, a twin or a translation key in
`en.ts` without its `es.ts` counterpart (or the reverse). The translations type
is exhaustive, so a missing key is a compile error — but content is not.

**`'unsafe-inline'` or `'unsafe-eval'` added to `script-src`**, or a
hand-edited `Content-Security-Policy` in `dist/_headers`. The policy is
generated from the built output; edit `scripts/generate-csp.mjs`.

**Weakening a guard to make a check pass** — widening the PII deny-list,
loosening the SSRF guard, relaxing a coverage threshold, or deleting a test.
If a gate produces a false positive, fix the measurement, not the rule.

**User-agent-conditional content.** Serving different bytes to a crawler, a
scanner or a benchmarking tool than to a reader. Removed once already in the
Task 50 review; it must not come back.

## Escalate to `warning`

- **Raw greys or fique on light.** `text-gray-400/500` and their `dark:`
  variants are test-banned; `--color-cabuya-accent` (fique) fails AA as body
  text on light — use `-strong`.
- **`bg-cabuya-primary` with `text-white`.** Breaks in dark mode. Use the fill
  pair: `bg-cabuya-fill` + `text-cabuya-on-fill`.
- **`<img>` without `width` and `height`** — layout shift, and an a11y rule
  here.
- **A hardcoded user-visible string** instead of `getTranslations(lang)`, or a
  hardcoded `/es` instead of `getUrlPrefix(lang)`.
- **A Svelte island where an `.astro` file would do**, or `client:load` where
  `client:visible` / `client:idle` suffices. Docs pages carry **0 KB JS**
  unless they have an island; the landing budget is 40 KB.
- **A page wrapper importing a layout directly** — layout belongs inside the
  `*Page.astro` component.
- **Page copy changed without its `.md` twin.** Every page serves a complete
  twin, and `md:check` measures coverage.
- **Spanish missing diacritics** — `codigo`, `version`, `pagina`, `analisis`,
  `manana`, `espanol`, `diseno`, `tamano`, `pequeno` in content or `es.ts`.
- **A generated file hand-edited** rather than regenerated: `public/llms.txt`,
  `dist/_headers`, `packages/validator/src/generated/**`,
  `spec/SPA_EXCLUSIONS.md` in the skill repo. Each has a `--check` in CI.
- **A finding message that blames rather than instructs.** Validator messages
  name the fix imperatively, one violation per message, and never moralise —
  a team that feels judged stops running the validator.

## De-escalate to `info`, or omit

- Anything **Biome** enforces — formatting, import order, quote style. It is a
  CI gate; do not duplicate it.
- Pure type errors — `astro:check` gates them.
- Test naming or structure preferences.

## Do not comment on

- Generated image binaries under `public/images/**`.
- Vendored agent tooling: `.agents/skills/**`, `.dwp/**`,
  `tmp/repositories/**` (except `cabuya-skill`, which is this project's).
- `docs/context/**` — the frozen founding record. It is historical by design
  and `spec/` wins where they differ.
- `packages/validator/src/generated/**` — Ajv's ahead-of-time output.
- ESLint/Prettier suggestions. This project uses **Biome exclusively**.

## Conventions worth knowing before flagging

- **Pages**: one `*Page.astro` per route in `src/components/pages/`, receiving
  `lang`. Root routes render `lang="en"`; `src/pages/[lang]/` serves the rest
  via `getStaticPaths`.
- **`spec/` and `registry/` are bounded** (B1–B7): read only through
  `spec-loader.ts` / `registry-loader.ts`, never imported directly. The
  `spec:boundary` gate scans `src` and `functions`.
- **Measured badge state lives in KV, never in git.** That is what makes a
  badge a measurement.
- **The five never-bend rules of the skill pack** apply to anything under
  `tmp/repositories/cabuya-skill`: no person-level data, no contact values in
  feeds, no scraping, honour the crawl policy, never claim unmeasured
  conformance.

## The gate a diff must pass

```
pnpm run biome:check && pnpm run astro:check && pnpm run test && pnpm run build
```

Plus, for content or copy:

```
pnpm run md:check:strict && pnpm run lang:check:strict &&
pnpm run seo:check:strict && pnpm run parity:check:strict &&
pnpm run redirects:check:strict
```

Plus, for anything touching `spec/`, `registry/` or the validator:

```
pnpm run spec:check:strict && pnpm run spec:boundary &&
pnpm run registry:check:strict && pnpm run checks:catalogue:strict
```

**Cite the specific gate** when a change plausibly breaks one.

## Commits

Conventional Commits, English, signed off (`git commit -s` — the DCO is
CI-enforced). Scopes: `brand spec registry validator developers home i18n a11y
seo aeo forms nav internal agents gates`.
