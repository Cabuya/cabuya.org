# Writing Craft Guide — verification, citation and structure

> The mechanics of writing content that survives scrutiny. Voice lives in
> [`WRITING_VOICE_GUIDE.md`](./WRITING_VOICE_GUIDE.md); what-goes-where lives
> in [`MESSAGING.md`](./MESSAGING.md). This guide is about **facts**: how they
> enter a page, how they are cited, and how structure keeps them honest.
> (The blog-specific narrative machinery of the previous site was retired with
> the blog; this is the standards-site edition.)

---

## 1. The verification principle (non-negotiable)

**Every factual statement is verified before it is written, and carries its
source with it.** Not "verified once, somewhere" — verified against a source
the reader can reach, cited at the point of use.

The failure this prevents is specific to aid tech: a plausible number
("20 apps", "260 missing") drifts from page to page, mutates, and eventually
the site asserts something nobody can back. Cabuya's founding argument is that
unverified data is the problem — the site cannot commit the sin it exists to
fix.

### The verified sets

| Kind of fact | Authoritative source | Rule |
|---|---|---|
| Emergency figures (deaths, injuries, missing, collapsed structures) | `docs/context/DECISIONS.md` M7 — each with its press source | Cite the named outlet + date; never round, never extrapolate |
| Ecosystem facts (app counts, API availability, observed behavior) | `docs/context/APPS_MATRIX.md` + the dossiers | Cite the dossier; facts are dated snapshots ("as probed 2026-08-16") |
| Protocol norms | `spec/versions/{v}/` | Link the anchor; never restate a norm in different words |
| Measured conformance | The registry's KV state via `/registry/{id}` | Link the publisher page; never quote a level without its timestamp |
| Standards facts (GBFS, HSDS, CAP, HXL behavior) | `docs/context/PRIOR_ART.md` (206 citations) | Cite through it or directly to the standard |
| Institutional facts (official channels, CAP adoption in Colombia) | The mesa técnica report (`docs/context/informe-interoperabilidad-mesa-tecnica.md`) | Cite the report; it carries its own source list |

## 2. How to cite

- **In-page:** a normal link at the claim, on meaningful anchor text — «según
  el informe de la mesa técnica (16 de agosto de 2026)», not a bare footnote
  number. Standards prose reads better with inline attribution than academic
  apparatus.
- **Dates on volatile facts.** Anything that can change (availability,
  adoption, measured levels) carries its measurement date.
- **Sources in both languages point to the same artifact.** Do not cite an
  English summary in EN and a different Spanish blog in ES — parity includes
  provenance.
- **The registry is the only citable source for adoption claims.** "X
  publishes a Cabuya feed" is writable exactly when `/registry/x` shows a
  measured state that says so.

## 3. Quotes and third parties

- Direct quotes require the speaker's **written permission** and their
  preferred attribution — including team members and the founder
  (MESSAGING §7). Without permission, paraphrase without attribution.
- Never characterize a third-party app's *quality* — describe observed,
  dated behavior ("as of the 2026-08-16 probe, the endpoint answered 200")
  and let the reader conclude.
- Security-sensitive observations about third parties are **never published**
  (the disclosure queue is summary-only by design — `docs/context/
  SECURITY_REVIEW.md` §4). If a draft needs such a fact, the draft is wrong.

## 4. Structure for standards prose

- **Answer first.** Every page and every section leads with the thing the
  reader came for; background follows. (FAQ answers: the answer in the first
  sentence, the norm link in the second.)
- **Tables for parallel facts, prose for causality.** If three things share a
  shape, it's a table; if one thing explains another, it's a sentence.
- **One concept, one home** (MESSAGING §3): deep-explain once, link
  everywhere else. Restating invites drift.
- **Worked examples over abstractions.** The spec's own teaching style — two
  valid examples, three invalid-with-designed-errors — is the house pattern:
  show the failing case and its fix, not just the rule.
- **Progressive disclosure:** quickstart → spec section → schema field →
  check id. Each layer links down; none requires the layer below to be
  useful.

## 5. Internal linking discipline

- Link normative words to normative anchors (`the locator rule` →
  `/developers/spec/0.1/3-the-feed#3-1`).
- Check ids are always links (`REC001` → `/developers/validator/checks#REC001`).
- Cross-language links stay in-language (`/es/...` pages link `/es/...`
  targets); the language switcher is the only cross-language edge.
- No orphan pages: every page is reachable from nav, its section index, or a
  parent — `links:check` (migration Task 25+) enforces resolution.

## 6. Redundancy and drift detection

Before publishing, scan for these:

- The same fact stated with different numbers anywhere on the site (grep the
  number; grep its neighbors).
- A norm paraphrased instead of linked (search for MUST-adjacent language
  outside `spec/`).
- A duplicated explanation that MESSAGING assigns to another owner.
- Copies of example JSON that could drift from `spec/examples/` — always
  import/include the canonical fixture; never paste a second copy.

## 7. Atemporal writing

Pages live for years; the emergency that started this project is a dated
event, not the site's present tense.

- Write "Colombia's August 2026 seismic emergency", never "the recent
  earthquake" / "el sismo reciente".
- No "currently/actualmente" without a date; no "new/nuevo" as a property
  (everything stops being new).
- Roadmap language names phases, not seasons ("ships with the P8 phase",
  not "coming this fall").
- History sections are where the phase-tie vocabulary lives
  (VOICE_GUIDE §5) — dated, sourced, past-tense.

## 8. Pre-publish verification checklist

- [ ] Every figure traced to its authoritative set (§1 table) and cited at
      point of use with a date where volatile
- [ ] No norm restated — linked to its anchor
- [ ] No quote without written permission; no third-party characterization
- [ ] Example JSON imported from canonical fixtures, not pasted
- [ ] Number-drift grep run on any figure the page introduces
- [ ] Atemporal scan (§7) clean
- [ ] Both languages carry the same facts and the same sources
