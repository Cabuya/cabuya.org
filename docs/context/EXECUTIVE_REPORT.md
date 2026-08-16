# EXECUTIVE_REPORT.md — Unified Aid Protocol: Founding Analysis

> Plan: `PLAN_unified_aid_protocol_analysis` · Completed 2026-08-16 ·
> Analysis-only (zero production changes) · Security verdict: **PASS**

## 1. Executive Summary

The 20 apps of the corag.app ecosystem agreed they want a unified protocol to
share and consume data. This plan produced the complete founding analysis and
the execution roadmap: **38 documents** covering every app's real technical
surface, the canonical data model, the standards landscape, the protocol v0.1
design with machine-verified schemas, a strong-brand naming strategy with a
verified shortlist, neutral governance, the blueprint for the two repos
(website+portal and agent skill), a per-app adoption playbook, a bilingual
RFC-0 ready for signatures, and a phased master plan.

**The single most important finding:** the protocol is not a hypothesis — the
ecosystem already built pieces of it by hand. The real integration surface is
double the directory baseline (**4 public APIs, 3 MCP servers**), AquíAyuda
ships a hand-rolled 5-adapter proto-protocol, three teams independently
invented the same freshness-verification model, and two apps already exchange
records using `source`+`externalId` idempotency. Meanwhile the cost of *not*
standardizing is documented at production scale: the same physical shelter
exists in up to **9 identifier spaces**, including one building listed "Activo"
in one app and "cerrado" in another — and consolidation has begun (one app is
being absorbed into Corag right now).

**Recommended next action:** execute Phase 0 this week — present
`RFC-0_draft.md` to the group and open the signature PR. **The name and domains are already decided: Cabuya · cabuya.org · cabuyaprotocol.org** (see `DECISIONS.md`).

## 2. Product Impact

- **For app teams:** publishing to the network drops from "build an
  integration" to **one afternoon** (validated against real stacks; the agent
  skill runs the validator loop). Aggregators stop paying the manual-sync cost
  — AquíAyuda's five bespoke adapters become one protocol client. Every team
  keeps its own database, IDs, and product.
- **For helpers and affected people (indirect):** the contradictions that send
  a donor to a closed collection center become visible and resolvable —
  cross-app records carry who-said-it, when-confirmed, and "ya no está"
  signals. No impact figures are claimed here: those belong to the apps
  (Rule-0).
- **For agents/AI clients:** one network MCP surface (`search_places`,
  `get_place`, `publish_place`) over all conforming publishers, plus a skill
  that makes any coding agent protocol-fluent offline.
- **For the region (north star):** the registry's public measured history
  becomes the evidence base for the "Silicon Valley colombiano" ambition —
  vision with preconditions, never invented traction.

## 3. Technical Details

### Deliverable index (`analysis_results/`)

| File | One line |
|---|---|
| `apps/APP_{slug}.md` ×20 | Evidence-grade dossier per app: probes (timestamped), architecture, entities, integration surface, adoption effort |
| `APPS_MATRIX.md` | Consolidated matrix: 4 APIs + 3 MCPs confirmed, 5 overlap clusters, ~20 duplicate-place cases, adoption waves, sync/discovery addendum |
| `ENTITY_MODEL.md` | Canonical `place` model: two-identifier design, 3-axis status, verification core, 20-app field mapping, worked cases A–E, ID requirements R1–R12, Q1–Q10 |
| `PRIOR_ART.md` | 12 adopt/adapt/invent verdicts ("HSDS semantics, GBFS mechanics"), 6 case studies, license blockers (AIRS), Colombian legal floor |
| `PROTOCOL_DESIGN.md` | The v0.1 proposal: L0–L4 ladder, one-schema-four-transports, write federation, consumption rules, exclusions (join prohibition), wind-down + suspension |
| `schemas/` + `examples/` | JSON Schema 2020-12 (ajv-verified) + 2 valid / 3 invalid-with-designed-errors fixtures |
| `BRAND_AND_NAMING.md` | 47 candidates verified live; shortlist of 5; Cabuya recommended; 3-phase brand test; master-brand architecture |
| `GOVERNANCE_AND_LICENSING.md` | Model B→C governance, RFC process with mandatory PII gate, CC0/Apache-2.0/per-feed licensing, brand-badge rules |
| `PRODUCTS_BLUEPRINT.md` | The 2 repos: website (13 inherited CoragWeb patterns + 7 named exclusions), skill (5 sub-skills + scored acceptance test), validator (1 engine, 4 harnesses), MCP server, walking skeleton |
| `ADOPTION_PLAYBOOK.md` | 20/20 adoption paths, waves 0–3 + respected tiers, early implementers, weeks-1–2 list, 15-risk register, comms kit |
| `RFC-0_draft.md` | Founding agreement, 10 articles × ES/EN, signature-ready; Art. 7 handles the convener-neutrality tension openly |
| `EXECUTION_PLAN.md` | **The master roadmap**: phases 0–5, M0–M7 verifiable milestones, D1–D26 decision register, kill/pivot criteria, Spanish one-pager |
| `SECURITY_REVIEW.md` | PASS: audits with evidence, threat-model pass (1 gap fixed in-review), 5-item private-disclosure queue (details withheld) |

### Key design decisions (argued in the deep docs)

One schema, four transports (static ≡ read API ≡ write API ≡ MCP) ·
GBFS envelope + invented verification triple · `{publisher_id}:{local_id}` IDs,
zero coordination · conformance measured by validator, never declared ·
person-data excluded by join prohibition · contact never travels (link-out) ·
consent in the envelope (`license` + `permitted_use`) · no signatures in v0.1
(upgrade path preserved) · spec lives in the website repo's bounded CC0 `spec/`
with a published extraction procedure.

### Conformance ladder

L0 listed → L1 linked (manifest) → L2 publishes (feed, *one afternoon*) →
L3 serves & consumes → L4 federates (writes + MCP), plus **directory-only** and
**link-out-only** as respected classes.

## 4. QA Verification Guide

**Reading order:** this report → `EXECUTION_PLAN.md` → `PROTOCOL_DESIGN.md` →
`RFC-0_draft.md` → the rest as needed (index above).

**Spot-checks you can run:**
1. Open any dossier (e.g. `apps/APP_pereiraayuda.md`) and click 2–3 source
   URLs — every claim carries a URL + UTC timestamp or an `unverified` marker.
2. Schema soundness: the plan validated both schemas with this repo's own
   ajv 8.20 (Draft 2020-12); valid examples pass, `invalid-1` fails with
   exactly its designed message. Re-run: see Task 4's Completion & Log for the
   command.
3. Placeholder scan: `grep -rn '\[TODO\|\[TBD' analysis_results/` → only
   deliberate synthetic fixtures appear (the name is decided: Cabuya).
4. Clean-worktree contract: `git status --porcelain` → empty.
5. Bilingual RFC-0: Articles 0–9 exist in both languages with identical
   structure; Spanish orthography grep is clean.

## 5. FAQs

**P: ¿Esto es de Corag? / Is this Corag's protocol?**
R: No. Corag convenes and ships first, but the spec is CC0, the registry is
PR-governed, RFC-0 caps any org at 2 seats, v1.0 requires 2 non-Corag
maintainers, and the extraction procedure for the spec is published up front.
Art. 7 of RFC-0 addresses this head-on — including the SOS Terremoto migration.

**P: ¿Por qué no una sola base de datos compartida? / Why not one shared database?**
R: Because the evidence shows specialization works (a crack-report app and a
collection-center map are different products) and central custody creates a
single owner — the thing the group is avoiding. The protocol shares *records*,
not *databases*; every team keeps its own.

**P: ¿Por qué archivos estáticos primero? / Why static files first?**
R: 16/20 apps have no public API today, but 9/20 can generate a JSON file in an
afternoon. GBFS proved this model at 535+ volunteer publishers. The read/write
APIs are the same schema — the floor is low, the ceiling is the end goal.

**P: ¿Qué pasa con las personas desaparecidas? / What about missing persons?**
R: Never in the protocol — a join prohibition, not just omitted fields. Four
apps hold person data; they participate with their non-person entities only,
and people-tools integrate by link-out. This is permanent and not revisitable
by RFC (Artículo 4).

**P: ¿Qué gana mi app? / What does my app gain?**
R: Concretely per app in `ADOPTION_PLAYBOOK.md` §2 — e.g. aggregators delete
bespoke adapters; publishers get their data into every consumer + the agent
surface; everyone gets the dedupe signals that end the
"Activo-here-cerrado-there" problem. Plus a measured badge, not a bought one.

**P: ¿Quién paga el dominio? / Who pays for the domain?**
R: Year-1 costs ≈ domains only (`GOVERNANCE_AND_LICENSING.md` §6): everything
runs on free tiers by design. Custody is shared per the governance doc.

**P: ¿Por qué el nombre no está decidido? / Why isn't the name decided?**
R: Because the group votes — that's the point. The shortlist is verified
(domains/GitHub/npm) and scored; Cabuya is the recommendation, with the full
brand case in `BRAND_AND_NAMING.md` §5.

**P: ¿Y si solo 2 apps lo implementan? / What if only 2 apps implement it?**
R: The kill criterion is explicit: < 3 independent implementations by end of
phase 3 kills the "protocol" claim, and the fallback (documented bilateral
integrations) is already written down. No zombie standard.

**P: ¿Cómo evita datos viejos o falsos? / How does it handle stale or fake data?**
R: Freshness is core (mandatory `last_updated`, honest `last_confirmed_at:
null`, negative confirmation, consumer display MUSTs, `stale` badges) and the
registry can suspend a malicious publisher through a public, appealable process
(§7.5 — added by this plan's own security review).

## 6. Next Steps

**Phase 0 (this week — from `EXECUTION_PLAN.md`):**
1. Present RFC-0 to the group channel; open the signature PR.
2. Register cabuya.org + cabuyaprotocol.org (name decided; announcement text already drafted).
3. First co-maintainer conversations (PereiraAyuda, Pereira Responde/AquíAyuda).
4. Create the neutral GitHub org + `.github` repo.
5. Deliver the 5 private security disclosures (before federation talks).

**Turning phase 1 into its own DWP:** in the new website repo, run
`/dwp-create` with `PROTOCOL_DESIGN.md` + `PRODUCTS_BLUEPRINT.md` §4 + the
schemas as full context → `PLAN_validator_v01` (blueprint P0–P2 are its task
list; the 5 examples are its acceptance fixtures). Then `PLAN_portal_v01`
(P3–P4) and the skill repo's plan (P5). Each inherits the mandatory
security-review structure — the SSRF control set gets re-verified there.

**Follow-up in this repo (proposed, not executed):** the 5 baseline YAML
corrections (`APPS_MATRIX.md` §5) and the `probe-public-app` skill
(Task 10's evaluation) — both are small, commit-worthy changes for a normal
working session.

---
*All 11 plan tasks completed · security PASS · zero tracked-file changes ·
every claim sourced or marked unverified. The working group decides everything
that matters; this analysis just makes the decisions cheap.*
