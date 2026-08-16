# Information Architecture

The URL surface of `cabuya.org`, what each page is for, and the rules that keep
the two languages aligned.

> **This document describes the site, not the application.** Everything
> transactional — publishing a need, offering help, contributing, uploading
> evidence — happens at `ayuda.cabuya.org`. If a page here starts collecting
> information about a real person's situation, it is in the wrong repository.

## The two surfaces

| Surface | What it is | What lives there |
|---------|-----------|------------------|
| `cabuya.org` | This site | What Corag is, how the model works, the blog, the policies, the integration surface |
| `ayuda.cabuya.org` | Ayuda Directa | Needs, offers, contributions, responsables, evidence |

Every call to action that implies an action lands on the application. Every
explanation lands here.

## Language routing

Spanish is the primary language and is served **unprefixed**. English lives
under `/en`.

```text
/how-it-works        → Spanish
/en/how-it-works     → English
```

Route slugs are **English in both languages** (repo rule 21). Localized paths
used briefly during the migration redirect to their English equivalents in
`public/_redirects`.

`getUrlPrefix(lang)` produces the prefix. Never hardcode `/en` or `/es`.

## The URL surface

83 pages per language. Their shape:

### Home

`/` — the six-beat argument from [MESSAGING.md](MESSAGING.md), ending on the
application.

### How Corag works

Six pages explaining the model. All render through `InstitutionalPage.astro`
from an `InstitutionalPageCopy` in each locale file.

| Path | Answers |
|------|---------|
| `/how-it-works` | The five-step path of one delivery, and why money does not pass through us |
| `/transparency` | Received vs used-with-evidence, the review pipeline, what we protect |
| `/emergencies` | What a front is, how to take part — opening with the warning that this is not an emergency service |
| `/leaders` | What the responsable role commits you to |
| `/partners` | Three ways an organization joins |
| `/ecosystem` | Complementary civic apps network — directory + join form |
| `/developers` | Many interfaces, one network — and the honest state of public access |

### Community

| Path | Answers |
|------|---------|
| `/about` | What Corag is, where the name comes from, the values |
| `/contributors` | Who builds it |
| `/channels` | Where to find us, with the application marked as primary |
| `/contact` | The five intents, routed to the right form topic |

### Policies

| Path | Source |
|------|--------|
| `/conduct` | `src/content/pages/{es,en}/conduct.md` |
| `/governance` | `src/content/pages/{es,en}/governance.md` |
| `/contributing` | `src/content/pages/{es,en}/contributing.md` |
| `/privacy` | `InstitutionalPageCopy` in the locale files |

The first three are **content files rendered as pages** by `PolicyDocPage.astro`.
Editing them changes the live site, not only the agent surface.

### Blog

| Path | Count |
|------|-------|
| `/blog` | 1 index |
| `/blog/page/{n}` | pagination |
| `/blog/{slug}` | 51 posts |
| `/blog/tag/{tag}` | 13 tag pages |
| `/blog/series` | series index |

Posts are date-prefixed on disk (`YYYY-MM-DD_slug.md`) and the date is stripped
from the URL. Both languages share one English slug.

### Agent surface

Every page has a `.md` twin at the same path plus `.md`. Not a summary — the
`md:check` gate measures word coverage against the rendered HTML and fails a
page that lost a section.

| Path | Contents |
|------|----------|
| `/llms.txt`, `/llms-full.txt` | The catalogue |
| `/{page}.md` | Complete twin of every page |
| `/blog.md`, `/blog/{slug}.md` | Index with tags and counts, plus each post |
| `/.well-known/api-catalog` | Machine-readable service description |
| `/rss.xml` | Feed |

### Dev-only

`/internal/**` — the brand book, the component showcase, admin views. Excluded
from production through three layers: post-build deletion, sitemap filtering and
`noindex`. English only, and never linked from a public page.

## Navigation

One source: `src/lib/site-navigation.ts`. The footer and the agent-Markdown
navigation block both derive from it, and
`tests/unit/lib/site-navigation.test.ts` asserts the Svelte header and mobile
menu expose exactly the entries marked `inChrome`.

Adding a link means adding it there, not in three places.

```text
Main            Home · About · Contact
How Corag works How it works · Transparency · Emergencies · Leaders · Partners · Developers
Community       Contributors · Channels · Contributing · Governance · Code of Conduct · Privacy
Content         Blog · Blog series
Ayuda Directa   Go to the app  (external)
```

Chrome (header / mobile) exposes that surface as:

```text
Cómo funciona ▾   (How Corag works group)
Comunidad ▾       (About + Community group)
Blog · Contacto · Ir a la aplicación
```

About sits in the Community dropdown (with the people/policy pages) rather than as a
top-level link, so the bar stays short while every public page stays one click away.
## The middleware allowlist

`src/middleware.ts` holds `KNOWN_ROOT_PATHS` and `KNOWN_EN_PATHS`. Single-segment
paths not in the allowlist are rewritten to `/404`, **even when the page file
exists**.

Symptom when forgotten: the route works in dev and 404s in production, while
`/{route}/{sub}` works fine. The dev log shows `[404] (rewrite) /{route}` — the
`(rewrite)` is the tell.

## Redirects

`public/_redirects`, ordered most-specific first because Cloudflare does not
chain redirects and the first match wins.

Three families:

1. **Language swap** — every previously published `/es/...` path.
2. **Retired route families** — every route family from the site this codebase
   was forked from, plus the localized route slugs used briefly during the
   migration.
3. **Blog archive** — 52 rules mapping the Spanish source slugs from the
   previous site onto their English equivalents.

Two invariants, enforced by `pnpm run redirects:check:strict` against `dist/`:

- Every destination must resolve to a page that exists.
- No live page may appear as a redirect **source**, or the rule shadows the page
  and 301s it away from itself into a 404.

Both were broken in the imported file, and neither is visible in a diff or a
build — which is why the check exists rather than living in a checklist.

## Content relationships

```text
blog post ──author──▶ authors/{slug}.yaml
          ──tags───▶ tags/{tag}.md          (primary / secondary / subtopic)
          ──series─▶ series/{slug}.md       (optional, with seriesOrder)

page      ──twin───▶ pages/{es,en}/{slug}.md
channel   ──────────▶ rendered on /channels, primary one marked
```

## Rules that hold this together

1. **Every public page exists in both languages.** `parity:check` compares them
   against each other, not against correctness.
2. **Every page has a complete `.md` twin.** `md:check` measures coverage.
3. **Every page declares its language.** `lang:check` audits Spanish at `/` and
   English at `/en`.
4. **Every page carries a 130–160 character description.** `seo:check` enforces
   the band.
5. **No page collects personal data.** The forms take a message and a topic; the
   application takes everything else.
