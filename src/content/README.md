# src/content — content collections

Collections are defined in `src/content.config.ts` (Zod schemas; localized
fields are `{en, es}` objects so a missing translation is a build error).

Current state (migration Task 7): the Corag collections were decommissioned.
The Cabuya collections land with their tasks:

| Collection | Source | Task |
|---|---|---|
| `docs` | `src/content/docs/{en,es}/**` — portal prose | 23 |
| `specVersions`, `schemas`, `examples`, `rfcs`, `changelog` | `spec/` via `src/lib/spec-loader.ts` (boundary rule B2) | 25 |
| `publishers` | `registry/` via `src/lib/registry-loader.ts` | 28 |
