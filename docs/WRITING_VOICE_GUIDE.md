# Writing Voice Guide — cabuya.org

> How Cabuya sounds, in both languages. The narrative map (what to say, where)
> is [`MESSAGING.md`](./MESSAGING.md); the fact-verification machinery is
> [`WRITING_CRAFT_GUIDE.md`](./WRITING_CRAFT_GUIDE.md). This guide governs
> **every** user-facing sentence: pages, translations, error messages, badge
> copy, meta descriptions.

---

## 1. The register

**A serious technical standard that anyone can read.** The model is how
deepworkplan.com explains a methodology: calm, concrete, precise, generous
with mechanism, stingy with adjectives. Cabuya explains; it never sells.

Four properties every paragraph should have:

1. **Concrete.** Name the file, the command, the number, the level. "Put a
   12-line JSON file at `/.well-known/cabuya.json`" beats "easily expose your
   data".
2. **Humble.** The spec is a draft and says so. Metrics are targets and say
   so. Limits are stated, not written around.
3. **Mechanistic.** Prefer *how it works* over *what it promises*. The reader
   should finish a section able to predict the system's behavior.
4. **Warm without heroics.** This project exists because volunteers built
   twenty apps in a week. Respect that energy; never dress it in savior
   language.

## 2. The two languages

- **English is not a translation of the Spanish, nor vice versa.** Both are
  written natively, as first drafts in their own language, then checked for
  parity of *content* (the parity gate enforces sameness of substance, not of
  phrasing).
- **Spanish orthography is mandatory and gate-checked:** ñ, tildes
  (análisis, código, versión), interrogative accents (cómo, qué, cuál),
  opening ¿ and ¡.
- Spanish register: **tú** implícito/neutral for developers («publica tu
  feed»), never usted-formal corporate; institutional pages may use the
  impersonal («se verifica», «el registro muestra»).
- Machine tokens are never translated: check ids, JSON keys, level names
  (L0–L4), field names, `place_kind` values.
- Normative keywords (MUST / SHOULD / MAY, RFC 2119) appear **only** inside
  `spec/`. Site prose says "must" in lowercase prose voice without invoking
  the normative register.

## 3. Rule-0 in prose form

Before any sentence ships, it passes these:

- **Can we back it?** Every figure has a named source (the citable set:
  `docs/context/DECISIONS.md` M7). Every capability claim is shipped or
  labelled "draft"/"planned" with its phase.
- **Do we run it?** No CTA points at a channel, endpoint or process that does
  not exist today.
- **Did they agree?** No person or organization is named as participant,
  supporter or adopter without written opt-in. Quotes need permission
  (MESSAGING §7).
- **Did the validator measure it?** No conformance language without a
  measurement to link.

## 4. Anti-slop checklist (run on every draft)

AI-flavored scaffolding is banned. If a draft contains any of these shapes,
rewrite the paragraph from the facts up:

- "En un mundo donde…" / "In a world where…"
- "No es solo X, es Y" / "It's not just X, it's Y"
- "Ya sea que… o…" / "Whether you're… or…"
- "la clave está en" / "the key is"
- "imagina un futuro donde" / "imagine a future where"
- Rule-of-three adjective stacks ("fast, simple, and powerful")
- Empty transitions ("Moreover", "Furthermore", "Es importante destacar")
- Symmetric paragraph lengths and mirrored sentence templates
- Em-dash-driven aphorisms as a tic (one per section, maximum)
- Closing cheerleading ("¡El futuro es colaborativo!")

Humanization that IS welcome: specific numbers with sources, first-person
plural for real actions we took («publicamos el validador», not «se innovó»),
short declarative sentences at load-bearing moments, admitting costs and
trade-offs explicitly.

## 5. Vocabulary blocklist (all languages)

**Hype register:** revolucionario/revolutionary · disruptivo/disruptive ·
líder/leading · el estándar definitivo/the definitive standard · único/
one-of-a-kind · empoderar/empower · sinergia/synergy · solución integral ·
game-changer · next-generation · cutting-edge · seamless · world-class (about
ourselves) · innovador as filler · "unificamos el ecosistema".

**Savior register:** salvamos vidas · héroes · beneficiarios ·
los más vulnerables (as a label for people) · juntos podemos ·
manos que ayudan · dar voz a.

**Claim words:** certificado/certified (doubly banned — measurement is what
happens) · garantizado/guaranteed · "Powered by Cabuya" · oficial (except for
actual official channels: Cruz Roja, UNGRD, CAP).

**Phase-tie words** (banned from taglines, names, self-description; allowed in
history sections with sources): terremoto · sismo · emergencia · SOS ·
Pereira · Risaralda · Eje Cafetero · Colombia-as-brand-modifier.

## 6. Naming conventions in prose

- `Cabuya` capitalized as brand in prose; `cabuya` lowercase in paths,
  packages, handles. Never `CABUYA` (it is not an acronym).
- «Protocolo Cabuya 1.0» / "Cabuya Protocol 1.0" for the spec;
  «un feed Cabuya» / "a Cabuya feed" (never possessive: «el feed de Cabuya»
  is wrong — the feed belongs to the app).
- Badges always version-scoped: «Compatible con Cabuya 1.0» — a bare
  «compatible con Cabuya» is banned.
- Products: el validador Cabuya (`@cabuya/validator`), el registro Cabuya,
  la skill Cabuya, el servidor MCP de Cabuya.

## 7. Accessibility of language

- Sentences ≤ ~25 words where possible; one idea per sentence at load-bearing
  moments.
- Expand every acronym on first use per page (DIVIPOLA, CAP, MCP, RFC).
- Link text describes the destination («ver el catálogo de checks», never
  «haz clic aquí»).
- Numbers: use digits, thousands separators per locale (1.679 ES / 1,679 EN).
- Meta descriptions: 130–160 characters, composed from the page's actual
  content, both languages.

## 8. No placeholder content — zero tolerance

`[TODO:]`, `[TBD]`, `[AUTHOR:]`, lorem ipsum, empty sections with headings —
none of these ever ship, and the pre-commit grep enforces it. If content
isn't ready, the surface doesn't ship, or it states its own status honestly
("The public specification is a draft under review").

## 9. Pre-publish checklist

- [ ] Passes the anti-slop shapes scan (§4) and the blocklist (§5)
- [ ] Every figure carries a named source; every claim passes §3
- [ ] Both languages written natively; parity gate green
- [ ] Spanish orthography complete (gate + manual read-aloud)
- [ ] Naming conventions (§6) respected; badge language version-scoped
- [ ] Meta description in range; link texts descriptive
- [ ] No placeholder markers (grep)
