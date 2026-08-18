# Visual Inventory — every slot on cabuya.org

> The coverage contract. Every planned surface in
> `docs/INFORMATION_ARCHITECTURE.md` appears here exactly once, classified as
> **illustration** (wordless, generated), **diagram** (HTML/CSS component), or
> **skip** with a reason.
>
> Skip is the most common answer and should be. A protocol site earns trust by
> being readable, and an illustration on every section is decoration that slows
> the page and dates faster than the text.

---

## Landing (`/`, `/es`) — Task 21

| Slot | Class | Asset / component | Notes |
|---|---|---|---|
| Hero, right column | **illustration** | `HP-01` threads-becoming-cordage | Flagship. The one image most readers will ever see |
| "One schema, four transports" section | diagram | `OneSchemaFourTransports.astro` | Needs labels |
| Conformance ladder section | diagram | `ConformanceLadder.astro` | Needs labels |
| The network section | diagram | `NetworkFlow.astro` | Needs labels |
| Exclusion / what never travels | diagram | `ExclusionBoundary.astro` | Needs labels |
| "Join" section | **illustration** | `HP-02` the open knot | Warm close, no CTA art |
| Origin / the emergency | **skip** | — | Disaster imagery is banned (STYLE_GUIDE §8) and the prose is stronger alone |
| Publisher logos | **skip** | — | Inclusion is not endorsement. Logos would read as partnership |

## Developers portal

| Slot | Class | Asset / component | Notes |
|---|---|---|---|
| `/developers` header | **illustration** | `DV-01` the loom | Sets the portal apart from the landing |
| `/developers/quickstart` header | **illustration** | `DV-02` the first thread | Small, warm, above the five steps |
| Quickstart step path | diagram | `QuickstartPath.astro` | Needs labels |
| `/developers/validator` header | **illustration** | `DV-03` thread through a gauge | Abstract measurement, no dials or gauges that read as instruments of judgement |
| Validator fix loop | diagram | `ValidatorLoop.astro` | Needs labels |
| `/developers/spec/*` | **skip** | — | Normative text. Illustration beside a MUST clause invites the reader to skim it |
| `/developers/schemas/*` | **skip** | — | Generated reference. Art would be noise between field tables |
| Feed anatomy (quickstart, spec §3) | diagram | `FeedAnatomy.astro` | Needs labels |
| Verification block (spec §6) | diagram | `VerificationBlock.astro` | Needs labels |
| `/developers/skill` header | **illustration** | `DV-04` the handover | The skill is a thread passed to an agent |
| `/developers/consume`, `/profiles`, `/mcp`, `/faq` | **skip** | — | Short reference pages; a header illustration on each would dilute the four that matter |

## Registry and governance

| Slot | Class | Asset / component | Notes |
|---|---|---|---|
| `/registry` header | **illustration** | `RG-01` the woven net | Nodes with no names — the registry lists organisations, not people |
| Registry empty state | **illustration** | `MK-02` the waiting thread | Small mark, transparent |
| `/registry/{publisher}` | **skip** | — | A measurement page. Art next to a badge state would soften a factual claim |
| `/governance` header | **illustration** | `RG-02` hands and cords | Hands only, never faces (STYLE_GUIDE §8) |
| `/trademark` | **skip** | — | Policy text |
| `/join` header | **illustration** | `RG-03` the added strand | The funnel's one warm image |
| `/rfcs`, `/changelog` | **skip** | — | Indexes. They should look like indexes |

## Why Cabuya (`/about`, `/es/about`)

| Slot | Class | Asset / component | Notes |
|------|-------|-------------------|-------|
| Hero, right column | **illustration** | `AB-01` the fique plant | A specimen plate, not a motif: the page's first claim is that the name comes from a real plant. `hidden` below `lg` |
| *It is made, not found* | **illustration** | `AB-02` leaf to fibre to cord | The metaphor is exact, and this is the proof of it |
| *A name that belongs to nobody* | **illustration** | `AB-03` five cords, no centre | Neutrality drawn as a shape — no strand is the hub |
| *«Coger la cabuya»* | **illustration** | `AB-04` the open bight | A loop held open and offered, which is what the idiom means |
| *Estar en la cabuya* (the downside) | **skip** | — | The honest cost of the name. Illustrating a jam would make a joke of the one section that exists to be unflattering |
| *What we did not take* (Aluna) | **skip** | — | It names a sacred concept of living peoples in order to say it is not ours to use. Any drawing beside it would do the appropriating the section refuses |
| Where the plant grows | **skip** | — | No maps, no flags, no borders — a fact about a plant must not become a territorial claim (prompts/README §06) |

## Machine and utility surfaces

| Slot | Class | Asset | Notes |
|---|---|---|---|
| Default OG card | **illustration** | `OG-01` at exactly 1200 × 630 | Founder requirement, first-class entry |
| Per-section OG variants | **deferred** | `OG-02` guidance | One card until traffic shows a section deserves its own |
| 404 | **illustration** | `MK-01` the re-tied thread | The one place a small piece of warmth is worth the bytes |
| Section divider, long pages | **illustration** | `MK-03` the braid ornament | Typographic breath. Used three or four times on the longest page, never between every heading |
| `/internal/*` | **skip** | — | Dev-only tooling |
| `llms.txt`, `.md` twins, `/api/*` | **skip** | — | No visual surface |

---

## Counts

| Class | Count |
|---|---|
| Illustrations, all generated and integrated | **17** (3 flagship, 7 high, 5 medium, 2 low) + the two share cards |
| Diagram components | 8 (all built) |
| Deliberate skip decisions | 13 (covering 18 surfaces — some rows group a family of pages) |

Thirteen generated images for a site with thirty-odd surfaces, against ten
skip decisions covering fifteen of them. That ratio is the point: each image has to earn its place, and
the pages that skip are not poorer for it.
