# I18N Guide — EN at `/`, ES at `/es`

> The implementation guide for decision **D-W1**
> ([`docs/DECISIONS.md`](./DECISIONS.md)): English canonical at the root,
> Spanish at `/es`, one `[lang]` dynamic tree. *(The mechanism ships in
> Task 8; this guide is its contract.)*

---

## 1. The topology

| Language | URLs | Content sources |
|---|---|---|
| English (default) | `/{route}` | Root route files render `<XPage lang="en" />`; `src/content/docs/en/` |
| Spanish | `/es/{route}` | One `src/pages/[lang]/` tree serves it via `getStaticPaths`; `src/content/docs/es/` |
| Future language N | `/{code}/{route}` | The same `[lang]` tree — see §4 |

Rules that never bend:

- **Route slugs are English in both languages** (`/es/developers/quickstart`,
  never `/es/desarrolladores/…`).
- **URL-first**: the URL is the only language signal. No browser-language
  redirect, no localStorage bounce. The switcher links the same route in the
  other language.
- Machine surfaces (`llms.txt`, `/api/*`, `/badge/*`, raw schemas, `.md`
  twins' URLs) are language-neutral or EN-pinned — no `/es` variants.
- **The protocol's feed-string baseline stays `es`** (spec rule). Site
  topology and protocol data language are different decisions.

## 2. The moving parts

| File | Role |
|---|---|
| `src/lib/language-codes.ts` | Dependency-free code registry + metadata (name, native name, OG locale) |
| `src/lib/i18n.ts` | `DEFAULT_LANGUAGE='en'`; active languages derived from translation-file presence; `getUrlPrefix(lang)` |
| `src/lib/translations/types.ts` | The exhaustive `SiteTranslations` type — **a missing key in any language is a type error** |
| `src/lib/translations/{en,es}.ts` | The string tables, written natively |
| `src/pages/*` (root) | English routes |
| `src/pages/[lang]/*` | Everything else, `getStaticPaths` over non-default active languages |
| `src/middleware.ts` | Language-aware allowlist (`KNOWN_ROOT_PATHS` + per-language paths) |
| Head component | `<html lang>`, hreflang pairs + `x-default`→EN, OG locale — all derived from the registry |

## 3. Authoring rules

1. Both languages ship in the same commit — parity is a build gate
   (`parity:check:strict`), not a follow-up.
2. Write each language natively (voice guide §2). The parity gate checks
   sameness of **substance**, not phrasing.
3. All UI strings through `getTranslations(lang)`; the exhaustive type forces
   both files.
4. Content collections: localized fields are `{en, es}` objects (Zod-required).
5. Exception pattern — normative spec text is English-only; `/es` spec routes
   render the English body with a Spanish notice («El texto normativo se
   publica en inglés…»). This asymmetry is allowlisted in the parity gate
  .

## 4. Adding language N (the whole procedure)

1. Confirm the code + metadata exist in `language-codes.ts` (add if not).
2. Create `src/lib/translations/{code}.ts` exporting the full
   `SiteTranslations` object — the type won't compile until it's complete.
3. Create `src/content/docs/{code}/**` (English slugs).
4. Done. Routes, switcher, hreflang and sitemap derive from file presence.
   No routing edits, no middleware edits (the `[lang]` allowlist derives from
   the registry).

## 5. The gates

| Gate | Asserts |
|---|---|
| `lang:check(:strict)` | `/` renders English; `/es` renders Spanish — in HTML and in the `.md` twin |
| `parity:check(:strict)` | `{route}` ↔ `/es/{route}` carry the same content (minus allowlisted asymmetries) |
| `md:check(:strict)` | Every page in every language has its complete twin |
| `seo:check(:strict)` | hreflang pairs complete + `x-default`; canonicals correct |
| Orthography greps | `docs/STANDARDS.md` §1 |
