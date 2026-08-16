# SECURITY_REVIEW.md — Plan Security Review (Task 9)

> **VERDICT: PASS — no unresolved critical findings.**
> 0 critical · 2 warnings (1 fixed during review, 1 is an external-disclosure
> queue) · 4 info. The plan produced analysis documents only; zero tracked files
> changed. Reviewed 2026-08-16 (~11:55 UTC).

## 1. Scope & method

This plan changed no production code (analysis-only contract). The review
therefore audited: (a) the plan's own outputs (PII, secrets, probing conduct,
Rule-0 integrity), (b) the protocol design's threat model (it will move real
emergency data), (c) `docs/SECURITY.md` currency, (d) the AI Diff Reviewer
augmentation.

## 2. Findings table

| # | Severity | Finding | Outcome |
|---|---|---|---|
| F1 | **warning** | Protocol design covered voluntary wind-down (§7.4) but had no involuntary **registry suspension** procedure for a malicious publisher (person-data publication, fabricated places, impersonation) | **FIXED during review**: §7.5 added — suspension states, 48-h emergency path for PII incidents, public appealable record, no silent removals |
| F2 | **warning** | **External private-disclosure queue** (5 items affecting 4 ecosystem teams — details deliberately withheld from all public-facing outputs; see §4) | Open by design — these are other teams' systems; disclosure scheduled as Phase 0 task 0.6 in `EXECUTION_PLAN.md`, before any federation conversation |
| F3 | info | Synthetic PII-shaped strings exist in `schemas/examples/invalid-2-contact-and-personal-data.json` ("María Ejemplo Pérez", `+57 300 000 0000`, `example-app.invalid`) | **By design and documented**: they are the validator's deny-pass acceptance fixtures; obviously fictitious (`.invalid` domain, "Ejemplo" surname, all-zeros number) |
| F4 | info | Probe budget exceeded on 2 of 20 hosts (12 and 11 requests vs the ~10 guideline) | Justified and logged by the analyst: extra requests followed each site's own published docs chain (openapi.json, linked data pages); no auth/admin/write surface touched anywhere |
| F5 | info | Write API in no-auth emergency mode has no CAPTCHA/proof-of-work guidance | Accepted for v0.1: rate limiting + moderation queue are the specified mitigations; PoW would tax legitimate volunteer clients; revisit at first observed abuse |
| F6 | info | Registry PR workflow exposes contributor identities via normal GitHub metadata | Inherent to the chosen (and correct) PR-based governance; org-level accounts recommended in contributor docs |

## 3. Audit results (evidence)

| Audit | Result | Evidence |
|---|---|---|
| Tracked-file diff | **CLEAN** — 0 modified tracked files, branch `main` at `9b8d6de` | `git status --porcelain` = 0 lines; `git diff HEAD` empty |
| PII sweep (all outputs, ~30 files) | **CLEAN** — 1 phone-pattern hit and 1 name, both inside the designed invalid example (F3); 0 personal-email domains; only org-level role addresses (info@mallanet.org, team@helpthemdirectly.org — both published by their orgs) | grep sweeps over `analysis_results/` (phone/email/name patterns) |
| Secrets sweep | **CLEAN** — 0 key/token shapes | grep for sk-/pk-/JWT/bearer shapes |
| Responsible probing | **CLEAN** — 20/20 dossiers carry probe logs with UTC timestamps; robots `Disallow` honored (terremotocolombia `/api/` explicitly not probed); no individual case listings opened; missing-persons apps analyzed tool-level only | probe-log presence check; dossier text |
| Rule-0 sample (5 dossiers: corag, aquiayuda, gravitas, ayudared, sospereira) | **CLEAN** — all carry sourced timestamps (13–30 each) and honest `unverified`/`unreachable` markers (2–8 each); `unknown` never rewritten as "doesn't have" | grep counts per dossier |
| `docs/SECURITY.md` currency | **No update needed** — the plan shipped nothing; the repo's threat model (static site + public intake) is unchanged | analysis-only contract held |

## 4. Private-disclosure queue (details withheld by design)

Five findings about **other teams' systems**, surfaced incidentally during
public-surface probing. Publishing specifics would create risk before the teams
can fix them, so this report records only category + owner-count; the full
details live in the probe context and are to be delivered privately (Phase 0,
task 0.6 — a precondition for federation conversations, and itself an act of
the "crecemos juntos" principle):

1. An unauthenticated side endpoint exposing contact fields that the same
   site's HTML obfuscates (1 team).
2. Publisher personal names leaking through a free-text provenance field in an
   otherwise careful open API (1 team) — also the origin of the protocol's
   structured-`source{}` requirement.
3. Third-party publishable keys shipped in a client bundle (1 team, keys
   belonging to 3 others; publishable-tier, but rotation is warranted).
4. A production backend running with framework debug mode enabled, disclosing
   internal configuration (1 team).
5. Minor: a public redirect leaking an internal port (1 team).

None of these items' details, key values, or personal data appear in any
analysis output (verified by the sweeps in §3).

## 5. Protocol threat-model sanity pass

Checked the seven listed threats against `PROTOCOL_DESIGN.md` §6/§7 as written:

| Threat | Covered? | Where |
|---|---|---|
| Feed spoofing / app impersonation | ✓ | HTTPS + registry canonical URLs + PR review; §6 upgrade path to signatures |
| Poisoned place data (physical-safety risk) | ✓ (strengthened) | Moderation queues (write path), `contradictions_active`, registry review; **now also §7.5 suspension (F1 fix)** |
| Stale-data harm | ✓ | Mandatory feed `last_updated`, honest `last_confirmed_at`, consumer age-display MUSTs, badge `stale` state |
| ID squatting / namespace abuse | ✓ | R9 + write-API 409; `publisher_id` never reassigned |
| Aggregator amplification of bad data | ✓ | Chain preservation (§4.3.4) keeps record-level provenance and staleness intact through republication |
| Privacy of feed publishers | ✓ | Org-level contact only; role tokens in `confirmed_by`; F6 noted |
| SSRF via the live validator | ✓ (design-stage) | `PRODUCTS_BLUEPRINT.md` §2.7 control set + per-host rate limits + zero retention — must be verified again at implementation time (flagged for the future validator DWP's own security review) |

## 6. AI Diff Reviewer augmentation (Flow A)

Detection predicate satisfied: `.agents/skills/ai-diff-reviewer/SKILL.md` +
`.review/extension.md` both present.

### AI Diff Reviewer local review

**Outcome: no diff to review.** The current branch is `main` at `9b8d6de` with
an empty tracked diff and zero uncommitted tracked changes — the plan's
analysis-only contract means there is no code change for the diff-review
methodology to operate on. Recorded per the augmentation's instructions
("if the tool reports nothing to review, record that outcome"). The plan's
outputs were instead reviewed by the purpose-built audits in §3–§5 above,
which cover ground a diff review cannot (PII in analysis prose, probing
conduct, protocol threat model).

## 7. Residual risks

- The disclosure queue (F2) remains open until Phase 0 delivers it — tracked as
  `EXECUTION_PLAN.md` task 0.6.
- The SSRF control set and the validator's deny-pass are **designs**, not
  implementations; each future implementation DWP must carry its own security
  review (the mandatory-final-task structure already guarantees this).
- Analysis snapshots age: probe results are timestamps, not truths — the live
  ecosystem changes daily (one migration happened *during* the analysis).
