# Changelog — the Cabuya Protocol specification

All notable changes to the **specification** (this directory). Format:
[Keep a Changelog](https://keepachangelog.com/); versioning: SemVer with the
§8 rules (RC → normative requires a shipping publisher).

## [Unreleased]

### Changed

- **0.1 is no longer labelled a draft.** The introduction's DRAFT statement is
  removed and every section's `status` is `normative`. The specification
  continues to change through the RFC process, which is what the introduction
  now says instead — the label was the disclaimer, not the mechanism.

  §8.1's rule is untouched: a *release candidate* still becomes normative only
  after a publisher ships it publicly. 0.1 went from draft to normative without
  an RC stage, so the rule does not bind this transition. It does mean the
  spirit of that clause — the spec never outruns its implementers — is carried
  by the registry rather than by a label from here on.

## [0.1.0-draft] — 2026-08-16

### Added

- Initial public draft, transformed from the founding design record
  (`docs/context/PROTOCOL_DESIGN.md`, including Addendum A's mesa técnica
  integration — HXL on-ramp §1.3, official-channels link-out §7.1, CAP
  reference and `quantity_covered` reservation §8.5, place-id shape
  harmonization §5.2).
- Sections §0–§8 + non-normative Appendix A (decision log + the
  implementability walkthrough).
- Schemas 0.1: `manifest.schema.json`, `place-feed.schema.json`
  (JSON Schema 2020-12, absolute `$id`s).
- Five worked examples: 2 valid, 3 invalid with designed error messages
  (the validator's acceptance fixtures).
- Profiles: Core, Extended. Vocabulary: the equivalence dictionary.
- RFC process seeded: template + RFC-0001 (the founding agreement, draft).

**Status: DRAFT under working-group review — nothing is normative yet.**
