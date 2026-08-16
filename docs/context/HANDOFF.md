# HANDOFF.md — How to Use This Bundle

This folder is the **portable founding bundle** of the Cabuya Protocol
initiative. It contains everything needed to execute the next phases without
access to the CoragWeb repo or to this conversation.

## To start a new repo

1. Create the repo (`cabuya-website` or `cabuya-skill`).
2. Copy this entire folder into it as `tmp/cabuya-context/` (git-ignored) or
   `docs/context/` (tracked — everything here is publishable except note the
   security-disclosure queue in `SECURITY_REVIEW.md` §4 stays summary-only by
   design).
3. Run `/dwp-create` (DeepWorkPlan) passing the matching kickoff file as full
   context: **`KICKOFF_WEBSITE.md`** or **`KICKOFF_SKILL.md`**.

## Reading order (fresh reader)

`EXECUTIVE_REPORT.md` → `DECISIONS.md` → `EXECUTION_PLAN.md` →
`PROTOCOL_DESIGN.md` → the kickoff for your repo → deep docs as needed.

## Contents

| File / dir | What |
|---|---|
| `DECISIONS.md` | **Authoritative log of ratified decisions** (name Cabuya, cabuya.org + cabuyaprotocol.org, brand, 2 repos, principles, mesa técnica adoptions) |
| `KICKOFF_WEBSITE.md` / `KICKOFF_SKILL.md` | Self-contained execution briefs for the two new repos |
| `EXECUTIVE_REPORT.md` | Plan summary, deliverable index, QA guide, FAQs |
| `EXECUTION_PLAN.md` | Master roadmap: phases 0–5, milestones M0–M7, kill criteria, ES one-pager |
| `PROTOCOL_DESIGN.md` | The v0.1 normative proposal (+ Addendum A: mesa técnica integration) |
| `schemas/` | JSON Schemas (ajv-verified) + 5 examples (validator acceptance fixtures) |
| `ENTITY_MODEL.md` | Canonical `place` model, 20-app field mapping, crosswalks (= equivalence dictionary source) |
| `PRODUCTS_BLUEPRINT.md` | Repo-by-repo architecture (website, skill, validator, MCP, registry) |
| `BRAND_AND_NAMING.md` + `brand/` | Naming analysis + **final logo & palette** with measured contrast rules |
| `GOVERNANCE_AND_LICENSING.md` | Governance Model B→C, RFC process, licensing |
| `ADOPTION_PLAYBOOK.md` | 20-app adoption paths, waves, risks, comms kit |
| `RFC-0_draft.md` | Founding agreement (ES+EN), signature-ready |
| `MESA_TECNICA_ALIGNMENT.md` | Iteration vs. the institutional interoperability report |
| `APPS_MATRIX.md` + `apps/` | The 20-app evidence base (probes, timestamps) |
| `PRIOR_ART.md` | Standards verdicts (HSDS/GBFS/HXL/CAP…), case studies, licenses |
| `SECURITY_REVIEW.md` | Plan security audit (PASS) + disclosure queue (summary-only) |

Integrity rules that travel with the bundle: Rule-0 (no unbacked claims),
zero PII, person-data join prohibition, listing ≠ endorsement, conformance is
measured never declared.
