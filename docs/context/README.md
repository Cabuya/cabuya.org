# The Cabuya Founding Record (`docs/context/`)

This directory is the **ratified founding record of the Cabuya Protocol
initiative**, copied into the repository so the site's decisions travel with the
code. It was produced by the analysis phase that preceded this repository
(ecosystem probing of 20+ emergency-response apps, entity modeling, prior-art
review, protocol design, governance and brand work) and ratified by the founder
and the working group on 2026-08-16.

> **This is a historical record, not a live specification.** The normative spec
> lives at [`spec/`](../../spec/) in this repository. Where this record and
> `spec/` disagree, **`spec/` wins** — these documents capture what was decided
> and why at founding time, and they are not edited to track later changes
> (later decisions land in [`docs/DECISIONS.md`](../DECISIONS.md) and in the
> spec's own RFC process).

## Reading order (fresh reader)

1. [`EXECUTIVE_REPORT.md`](./EXECUTIVE_REPORT.md) — what the analysis produced
2. [`DECISIONS.md`](./DECISIONS.md) — the authoritative ratified-decisions log
3. [`EXECUTION_PLAN.md`](./EXECUTION_PLAN.md) — phases, milestones, kill criteria
4. [`PROTOCOL_DESIGN.md`](./PROTOCOL_DESIGN.md) — the v0.1 protocol proposal
5. [`KICKOFF_WEBSITE.md`](./KICKOFF_WEBSITE.md) / [`KICKOFF_SKILL.md`](./KICKOFF_SKILL.md) — the execution briefs
6. Deep documents below, as needed

## Contents

| File / dir | What |
|---|---|
| [`DECISIONS.md`](./DECISIONS.md) | **Authoritative log of ratified decisions** — name Cabuya, `cabuya.org` + `cabuyaprotocol.org`, brand, the 2-repo split, founding principles, and the mesa técnica adoptions (M1–M7) |
| [`KICKOFF_WEBSITE.md`](./KICKOFF_WEBSITE.md) / [`KICKOFF_SKILL.md`](./KICKOFF_SKILL.md) | Self-contained execution briefs for the two repositories |
| [`EXECUTIVE_REPORT.md`](./EXECUTIVE_REPORT.md) | Analysis-plan summary, deliverable index, QA guide, FAQs |
| [`EXECUTION_PLAN.md`](./EXECUTION_PLAN.md) | Master roadmap: phases 0–5, milestones M0–M7, kill criteria, ES one-pager |
| [`PROTOCOL_DESIGN.md`](./PROTOCOL_DESIGN.md) | The v0.1 normative proposal (+ Addendum A: mesa técnica integration) — source text of `spec/versions/0.1/` |
| [`schemas/`](./schemas/) | JSON Schemas (ajv-verified) + 5 worked examples (2 valid, 3 invalid-with-designed-errors) — source of `spec/schemas/0.1/` |
| [`ENTITY_MODEL.md`](./ENTITY_MODEL.md) | Canonical `place` model, 20-app field mapping, crosswalks (source of the equivalence dictionary) |
| [`PRODUCTS_BLUEPRINT.md`](./PRODUCTS_BLUEPRINT.md) | Repo-by-repo architecture: website, skill, validator, MCP, registry |
| [`BRAND_AND_NAMING.md`](./BRAND_AND_NAMING.md) + [`brand/`](./brand/) | Naming analysis + final logo & palette with measured contrast rules |
| [`GOVERNANCE_AND_LICENSING.md`](./GOVERNANCE_AND_LICENSING.md) | Governance Model B→C, RFC process, licensing split |
| [`ADOPTION_PLAYBOOK.md`](./ADOPTION_PLAYBOOK.md) | 20-app adoption paths, waves, risks, communications kit |
| [`RFC-0_draft.md`](./RFC-0_draft.md) | The founding agreement (ES + EN), signature-ready |
| [`MESA_TECNICA_ALIGNMENT.md`](./MESA_TECNICA_ALIGNMENT.md) | Iteration against the mesa técnica's institutional interoperability report |
| [`informe-interoperabilidad-mesa-tecnica.md`](./informe-interoperabilidad-mesa-tecnica.md) | **Primary source** — text rendition of the mesa técnica report itself (2026-08-16); see its provenance note for the one PII redaction |
| [`APPS_MATRIX.md`](./APPS_MATRIX.md) + [`apps/`](./apps/) | The 20-app evidence base (probes, timestamps, per-app dossiers) |
| [`PRIOR_ART.md`](./PRIOR_ART.md) | Standards verdicts (HSDS, GBFS, HXL, CAP, …), case studies, licenses |
| [`SECURITY_REVIEW.md`](./SECURITY_REVIEW.md) | Analysis-plan security audit (PASS). Its §4 private-disclosure queue is **summary-only by design** — details are delivered privately to the affected teams, never published |
| [`HANDOFF.md`](./HANDOFF.md) | How this bundle was designed to travel (its instructions produced this directory) |

## Integrity rules that travel with this record

These rules governed the analysis and remain binding on everything in this
repository:

1. **Rule-0 — no unbacked claims.** No invented figures, no endorsements that
   cannot be maintained, no CTAs to channels that do not exist. Emergency
   figures are citable only with named sources (`DECISIONS.md` M7).
2. **Zero PII.** No personal names, personal phone numbers, personal emails or
   personal media anywhere in this record. Org-level role addresses published
   by their own organizations are the only contact values allowed.
3. **Person-data join prohibition.** Person-level data never federates — a join
   prohibition, not a field omission. Link-out only, converging on official
   channels (Cruz Roja RCF; Registro Único de Damnificados/UNGRD).
4. **Listing ≠ endorsement.** Appearing in any inventory here (or in the
   registry) is not an endorsement.
5. **Conformance is measured, never declared.** Nothing here or anywhere in the
   project claims conformance that the published validator has not measured.
