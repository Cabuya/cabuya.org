# src/content — content collections

Collections are defined in `src/content.config.ts` (Zod schemas; localized
fields are `{en, es}` objects so a missing translation is a build error).

| Collection | Source |
|---|---|
| `docs` | `src/content/docs/{en,es}/**` — portal prose |
| `spec`, `schemas`, `examples`, `rfcs`, `changelog` | `spec/` via `src/lib/spec-loader.ts` (boundary rule B2) |
| `publishers` | `registry/` via `src/lib/registry-loader.ts` |
