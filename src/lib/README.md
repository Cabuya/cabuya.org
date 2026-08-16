# src/lib — shared utilities

| Module | What |
|---|---|
| `i18n.ts` | Language type, prefixes, validation (`docs/I18N_GUIDE.md`) |
| `language-codes.ts` *(Task 8)* | Dependency-free language registry |
| `translations/` | Exhaustive-typed string tables (`types.ts` forces every language) |
| `site-navigation.ts` | The single-source nav surface (header/footer/twins derive) |
| `markdown-for-agents.ts` | The `.md` twin serializer (`docs/aeo/MARKDOWN_FOR_AGENTS.md`) |
| `language-detect.ts` | Block-level language classifier used by the gates |
| `meta-description.ts` | 130–160-char description band enforcement |
| `constances.ts` | Site origin, timezone constants |
| `dates.ts` | Locale-aware date formatting |
| `satteri-plugins.ts` | HAST plugins for the Sätteri Markdown pipeline |
| `analytics.ts` | Outbound/scroll tracking bootstrap (retired with Umami; replaced in Task 36) |
| `spec-loader.ts` / `registry-loader.ts` *(Tasks 25/28)* | The ONLY doors into `spec/` and `registry/` (boundary rule B2) |

Conventions: kebab-case files, explicit exports, unit tests mirrored under
`tests/unit/lib/`.
