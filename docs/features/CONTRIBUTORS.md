# Contributors (Equipo) — Feature Guide

The `/contributors` page is the public **Team & contributors** directory for Corag (nav label: Equipo y colaboradores / Team & contributors).

## Routes

| Lang | URL |
|------|-----|
| ES (primary) | `/contributors` |
| EN | `/en/contributors` |

Page component: `src/components/pages/ContributorsPage.astro`  
Cards: `src/components/cards/ContributorCard.astro`, `src/components/cards/AllyCard.astro`  
Helpers: `src/lib/contributor.ts`, `src/lib/ally.ts`

## Content

### People

YAML entries in `src/content/contributors/{slug}.yaml` (schema in `src/content.config.ts`).

| Field | Notes |
|-------|--------|
| `roles` | Enum includes `organizer`, `alumni`, `contributor`, `mentor`, `founding-organizer`, etc. |
| `inactiveSince` | If set → person appears in the **past** section |
| `role` / `bio` | Localized `{ en, es }` display strings |
| `order` | Sort key within a section |

### Allies (communities & companies)

YAML entries in `src/content/allies/{slug}.yaml`. Logos under `public/images/allies/`.

| Field | Notes |
|-------|--------|
| `logo` | Horizontal wordmark for light backgrounds |
| `logoDark` | Optional wordmark for dark backgrounds (falls back to `logo`) |
| `kind` | `community` · `company` · `organization` |
| `role` / `bio` | Localized `{ en, es }` |
| `url` | Optional external site |

**UI IA:**

1. **Equipo interno** — active people with `organizer` or `founding-organizer`.
2. **Colaboradores** — other active people (e.g. `contributor`, `mentor`) who are not organizers — hidden when empty.
3. **Comunidades aliadas** — `kind: community` — hidden when empty.
4. **Empresas aliadas** — `kind: company` — hidden when empty.

Past / alumni profiles are not shown on this page for now (`inactiveSince` still works in the schema for later use).

## Adding someone

1. Add `src/content/contributors/{english-slug}.yaml` + avatar under `public/images/contributors/`.
2. For the internal team: `roles: [organizer]` (or `founding-organizer`), omit `inactiveSince`.
3. For collaborators: use roles such as `contributor` or `mentor`, and do **not** include `organizer` / `founding-organizer`.
4. Keep **slugs stable** — other surfaces reference them via `getContributorsBySlugs`.

## Adding an ally

1. Add `src/content/allies/{english-slug}.yaml` + authorized logo under `public/images/allies/`.
2. Set `kind` to `community`, `company`, or `organization`.
3. Do **not** publish a logo without express authorization (see `/partners`).

## Related

- Team grids reuse `getContributorsBySlugs`
- Authors collection is separate (`docs/features/AUTHORS.md`)
- Agent markdown: `/contributors/index.md` (and `/en/...`)
- Institutional alliances explainer: `/partners`
