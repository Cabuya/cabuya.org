# Standards — canonical coding rules

> The rules every line of code in this repo follows. Enforced by Biome,
> `astro check`, the token tests and the gates; the rest is reviewed.

---

## 1. Languages

- **Code, comments, commit messages, identifiers, JSON keys, schema field
  names, check ids, repo docs: English.** No exceptions.
- **User-facing content: English canonical, Spanish first-class**, both
  written natively (see `WRITING_VOICE_GUIDE.md`).
- **Spanish orthography is mandatory** in all ES content: ñ (`pequeño`,
  `diseño`), accented vowels (`análisis`, `código`, `versión`, `página`),
  interrogative accents (`cómo`, `qué`, `cuál`), opening `¿`/`¡`.

Quick validation before committing Spanish text:

```bash
grep -rn 'pequeno\|tamano\|diseno\|espanol\|manana\|companer' src/content/ src/lib/translations/es.ts
grep -rn 'analisis\|numero\|codigo\|ejecucion\|version\b\|pagina\|titulo\|proximo' src/content/ src/lib/translations/es.ts
```

## 2. Import order (MANDATORY)

```typescript
// 1. Node.js native modules
import { dirname, resolve } from 'node:path';

// 2. Third-party packages
import { defineConfig } from 'astro/config';
import { z } from 'astro:content';

// 3. Internal project modules (@ alias)
import Header from '@/components/layout/Header.svelte';
import { getTranslations } from '@/lib/translations';

// 4. Type imports (separate group)
import type { APIRoute } from 'astro';
```

## 3. TypeScript

- **Pinned to 6.x** — `astro check` depends on the TS 6 programmatic API.
  Dependabot is configured to ignore the major bump; do not override.
- Explicit types on exported function signatures. `any` is allowed by Biome
  but treated as a review smell — prefer `unknown` + narrowing.
- No non-null assertions (`!`) in new code; handle the undefined case.
- The validator core additionally bans Node-only APIs (test-enforced):
  `fetch`, `TextDecoder`, `crypto.subtle` only.

## 4. Naming

| Thing | Convention | Examples |
|---|---|---|
| Files: components | PascalCase | `DocsSidebar.svelte`, `HomePage.astro` |
| Files: lib/scripts | kebab-case | `spec-loader.ts`, `check-spec.mjs` |
| Routes/slugs | English kebab-case, both languages | `/developers/quickstart` |
| Check ids | `FAM###`, stable forever, never renumbered | `REC001`, `PII003` |
| Schema fields | `snake_case` English (the protocol's convention) | `last_confirmed_at`, `publisher_id` |
| Tokens | `--color-cabuya-{role}` | `--color-cabuya-accent-strong` |
| Brand in prose | `Cabuya` capitalized; `cabuya` in paths/packages; never `CABUYA` | `@cabuya/validator` |
| Env vars | SCREAMING_SNAKE, documented in `.dev.vars.example` | `DAILYBOT_FORMS_TOKEN` |

## 5. Component rules

- `.astro` for non-interactive content; Svelte only for real interactivity,
  with the lightest viable `client:*` directive (`visible` > `idle` > `load`).
- Page components receive `lang`; user-visible strings via
  `getTranslations(lang)`; URLs via `getUrlPrefix(lang)`. **Never** hardcode
  either.
- Props typed via an `interface Props`; defaults destructured.
- Design tokens only — the five hard rules of `docs/DESIGN.md` apply to every
  class list.

## 6. Markdown and content files

- Sätteri pipeline only; transforms are HAST plugins in
  `src/lib/satteri-plugins.ts`. Adding `remarkPlugins`/`rehypePlugins` or a
  `rehype-*` dependency is a build-review blocker.
- Frontmatter validated by Zod in `src/content.config.ts`; localized fields
  are `{en, es}` objects.
- `spec/` files: `.md`/`.json` only, RFC 2119 keywords allowed there and only
  there, stable §-numbered anchors.

## 7. Scripts and gates

- Gate scripts: plain Node ESM in `scripts/`, tabular output, exit 0/1, a
  `--strict` variant for CI, and **exported testable functions** (the gate is
  a thin runner around them).
- Bash shipped to users (skill repo): bash-3.2-safe, `set -euo pipefail`,
  shellcheck-clean.
- Never `curl | bash` in any docs or scripts — download, verify, then run.

## 8. Testing conventions

`*.test.ts` under `tests/unit/` (mirroring `src/` paths); fixtures under
`tests/fixtures/`; behavior-changing code ships with its tests in the same
commit; never weaken a test to pass a gate. Full policy:
`docs/TESTING_GUIDE.md`.

## 9. Git

Conventional commits (English, imperative, scoped), DCO sign-off (`-s`) on
every commit (CI-enforced), branch from `main`, one concern per PR. Never
commit secrets — a pushed secret is a leaked secret (rotate, don't just
remove).
