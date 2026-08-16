<!--
The Cabuya RFC template. Copy this file to NNNN-{slug}.md (next free number),
fill every section, open a PR. Normative changes to spec/ land ONLY through
this process. The Privacy & PII review can block on its own — person-level
data does not federate, ever.
-->

# RFC-NNNN: {title}

- **Status:** Draft | Proposed | Accepted | Declined | Withdrawn | Implemented
- **Author(s):** {name} ({app or "independent"})
- **Created:** YYYY-MM-DD
- **Tier:** normative | breaking | governance
- **Target release:** {version}
- **Discussion:** {PR link}

## Summary
One paragraph. What changes, in plain language.

## Motivation
The concrete problem. Which app hit it, with what data. Rule-0 applies:
cite a real feed or a real failure, or mark the motivation `hypothetical`.

## Non-goals
What this deliberately does not do. Prevents scope drift during review.

## Specification
The normative text, written so it could be pasted into the spec as-is.
Include the schema diff and at least one full worked example.

## Conformance impact
- Does an existing conforming feed stop conforming? (yes/no — if yes, this is `breaking`)
- New conformance level, or a change to an existing one?
- What does the validator have to check that it does not check today?

## Privacy & PII review  (MANDATORY — may block on its own)
- Does this field, alone or joined with any other public feed, identify a person?
- Could it identify someone's location, health status, immigration status,
  household composition, or the fact that they needed help?
- Does it move any person-level data across an app boundary?
  **If yes, the RFC is declined. Person-level data does not federate — link out instead.**
- Retention and correction: how is this field corrected or withdrawn once published?

## Migration & backwards compatibility
Upgrade path for existing publishers and consumers. Deprecation window.

## Reference implementation
Link to a working branch, a validator test case, or a live feed.
An RFC with no implementation is reviewable but not acceptable.

## Alternatives considered
Including "do nothing", and why it loses.

## Open questions

## Decision  (filled in by a maintainer at merge)
- **Outcome:** Accepted | Declined
- **Date:** YYYY-MM-DD
- **Window:** opened YYYY-MM-DD, closed YYYY-MM-DD
- **Approvals:** {maintainer} ({app}), {maintainer} ({app})
- **Objections raised and how resolved:**
- **Notes:**
