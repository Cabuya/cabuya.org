# Decision Log — cabuya.org (live)

> The **live** decision log for this repository. The founding, ratified
> decisions live in [`docs/context/DECISIONS.md`](./context/DECISIONS.md)
> (historical record — do not edit); this file records decisions made **after**
> founding, during and beyond the migration. Newest last. Each entry states
> what changed, why, and what it overrides (if anything).

| # | Date | Decision | Overrides |
|---|---|---|---|
| D-W1 | 2026-08-16 | Site language topology: **EN canonical at `/`, ES at `/es`**, via a `[lang]` dynamic tree | `docs/context/KICKOFF_WEBSITE.md` §3 (ES at `/`, EN at `/en`) — on this one point only |
| D-W2 | 2026-08-16 | The migration runs as **one direct multi-project plan**, not an orchestrator plan | — |
| D-W3 | 2026-08-16 | Site forms connect to **DailyBot Forms** (one contact/join form) | `docs/context/PRODUCTS_BLUEPRINT.md` §2.3's mailto-and-issues-only default |
| D-W4 | 2026-08-16 | npm package name is **`@cabuya/validator`** | The naming doc's earlier `cabuya-validator` sketch (`docs/context/BRAND_AND_NAMING.md` §7.1) — `docs/context/DECISIONS.md` P6 already ratified the scoped name |
| D-W5 | 2026-08-17 | Registry free text is **bilingual by schema**: `notes` is `{en, es}`, and `official_source.authority` carries a required `authority_lang` | The registry schemas' original single-string `notes` |

---

## D-W1 — English at the root, Spanish at `/es`

**Decision.** The site serves English at `/` and Spanish at `/es`, replacing
the inherited hand-maintained per-language page mirror with a single `[lang]`
dynamic route tree (the deepworkplan.com mechanism). Adding a future language
is one translations file plus content folders — no routing changes.

**Why:**

1. **The normative payload is English by policy already** (founding decision,
   `PRODUCTS_BLUEPRINT.md` §6.5): code, JSON keys, schema field names, check
   ids, RFC text and validator output. A Spanish-rooted site whose entire
   normative core is English is incoherent at the developer's first read.
2. **Standards live in English at the root** — IETF, W3C, GBFS, HSDS, OGC,
   CAP. An international maintainer evaluating adoption must not need to find
   a language switcher first.
3. **The scaling requirement is explicit** (founder): any other city or
   country must be able to adopt the protocol. The mirror pattern costs two
   wrapper files per route per language and does not scale past two; the
   `[lang]` tree runs 16 languages in production at deepworkplan.com.
4. **Spanish is not demoted.** The first twenty adopters are Colombian and the
   mesa técnica works in Spanish. Spanish keeps identical parity gates, is
   written natively (never translated-sounding), and `cabuya.org/es` is the
   URL used in every Colombian communication. Crucially, the **protocol's
   feed-string baseline stays `es` REQUIRED** (`spec` — from
   `PROTOCOL_DESIGN.md` §3.1): the site's default language and the protocol's
   data-language baseline are two different decisions, and flipping the first
   does not touch the second.

**Consequences.** Old `/en/*` URLs 301 to `/*`; indexed Spanish URLs 301 to
`/es/*`; hreflang pairs emit `en` ↔ `es` with `x-default` → EN; all five
content gates retargeted to the new topology (migration Task 8).

## D-W2 — Direct multi-project plan, not an orchestrator

**Decision.** The migration plan (`PLAN_cabuya_website_and_skill`) executes
both repositories directly, committing separately in each, rather than
spawning child DWPs.

**Why.** The skill **vendors this repo's `spec/`** with checksums — a hard,
one-directional artifact dependency, not two independent feature streams; the
skill's acceptance test asserts against the same five examples the website's
`spec:check` gate uses (one contract); and the skill repo starts empty, with
no `AGENTS.md` or toolchain for a child plan to honour.

## D-W3 — DailyBot Forms for the contact/join form

**Decision.** One contact/join form on `/join`, submitted through a Pages
Function to DailyBot Forms. No other web forms; conduct concerns go to the
email alias named in the Code of Conduct.

**Why.** The maintainer team runs on DailyBot — an inbox nobody staffs is the
documented failure mode the blueprint's mailto default risked. Privacy
posture: the site stores nothing; submissions go to the maintainers'
workspace; the form says so in both languages. (Founder decision, overriding
the blueprint's default.)

## D-W4 — `@cabuya/validator`

**Decision.** The validator publishes as the scoped package
`@cabuya/validator`; the CLI binary is `cabuya-validator`.

**Why.** The founding decision log (P6) ratified the `@cabuya` npm scope; the
earlier naming-doc sketch predated it. Scoped names prevent squatting and
group future packages (`@cabuya/mcp-server`).

## D-W5 — The registry's free text is bilingual by schema

**Decision.** `notes` in `registry/schema/{publisher-entry,official-source,
event}.schema.json` is an object with required `en` and `es`. Official sources
additionally carry a required `authority_lang` (BCP-47) beside the institution's
name.

**Why.** The registry pages render these fields verbatim in both languages, and
`notes` is where the most important caveat on the page lives — *this entry was
created from public information and the team has not confirmed it*. A
single-string field meant a Spanish reader saw that caveat in English, which the
language gate caught the moment the pages shipped. Making it bilingual in the
schema rather than translating at render time keeps the registry a tree another
organisation can lift whole: the translation belongs to the data, not to this
website.

`authority_lang` exists because an institution's legal name is not translated
in either direction. *Unidad Nacional para la Gestión del Riesgo de Desastres*
appears unchanged on the English page, where a screen reader would otherwise
read it with English phonemes. It is required rather than defaulted: the
registry is designed to hold sources from any country, and no language is the
right guess for all of them. The language audit was taught the general rule at
the same time — a phrase element carrying an explicit `lang` is a declaration,
not a translation defect.

**Cost.** Two schema changes and seven entries, done in the same commit. Every
future entry pays a translated sentence, which is the correct price for a
bilingual public record.

---

*To add a decision: append a table row and a section, in commit order. A
decision that reverses one of these gets a new number and names what it
reverses — history is never rewritten.*
