# src/components

| Dir | What |
|---|---|
| `pages/` | One `*Page.astro` per route (receives `lang`; owns MainLayout) |
| `layout/` | Header, ThemeToggle — the chrome (rebuilt fully in Task 18) |
| `home/` | Landing sections (rebuilt in Task 21) |
| `developers/` *(Task 23)* | Portal machinery: sidebar, TOC, code blocks, callouts |
| `registry/` *(Task 28)* | Registry table + publisher views |
| `diagrams/` *(Task 19)* | HTML/CSS diagram components (`docs/DIAGRAM_COMPONENTS.md`) |
| `editorial/` *(Task 18)* | Editorial primitives (Lead, Kicker, Rule, Figure) |
| `ui/` | Shared primitives (Section, Breadcrumbs, …) |
| Root files | `BaseHead`, `Footer`, `JsonLd`, `FormattedDate`, `HeaderLink` |

Rules: `.astro` unless genuinely interactive; lightest `client:*`; tokens only
(`docs/DESIGN.md`); strings via `getTranslations(lang)`.
