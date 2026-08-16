## What & why

<!-- One or two sentences: what this PR changes and the problem it solves. -->

## Type of change

- [ ] Site / portal code
- [ ] Content (pages, translations, docs)
- [ ] `spec/` (normative — must reference an accepted RFC or be editorial-only)
- [ ] `registry/` entry
- [ ] Validator (`packages/validator/`)
- [ ] CI / tooling

## Checklist

- [ ] Commits are signed off (`git commit -s`) — DCO
- [ ] `pnpm run biome:check` and `pnpm run astro:check` pass
- [ ] `pnpm run test` passes (and new/changed behavior is covered by tests)
- [ ] `pnpm run build` succeeds
- [ ] Content changes: the five content gates pass
      (`md:check` · `lang:check` · `seo:check` · `parity:check` · `redirects:check`)
      and both languages are updated
- [ ] **Rule-0:** every figure has a named source; no endorsement we cannot
      maintain; no CTA to a channel that does not exist; no conformance claim
      the validator has not measured
- [ ] No personal data anywhere in the diff (fixtures and docs included)
- [ ] `spec/` changes: editorial only, or the RFC is linked here
