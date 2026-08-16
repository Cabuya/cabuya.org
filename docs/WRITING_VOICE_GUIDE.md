# Writing Voice Guide

> **Companion doc:** [Writing Craft Guide](./WRITING_CRAFT_GUIDE.md) — narrative structure, fact verification, quote handling, figure markup, refinement patterns. This guide focuses on **voice** (vocabulary, tone, register, anti-AI-slop). Both are mandatory reading for anyone publishing on Corag (Corag).

## 1. Purpose

Corag publishes content from **multiple authors** — community organizers, vertical leads, speakers, mentors, and guest contributors. The voice must feel consistent across authors and across languages (Spanish primary, English first-class international) without flattening individual personality.

This guide captures three things:

1. **The Corag community voice** — what every Corag post should sound like, regardless of author.
2. **Author-mode patterns** — how the voice flexes for institutional pages, practical guides, explainers, field reports, technical notes and policy.
3. **Anti-AI-slop discipline** — the patterns that signal AI-generated writing and how to avoid them. The voice rules win when they collide with the slop list.

Editors enforce this guide before publishing. The `content-writer` agent uses it as its operating manual. The `i18n-guardian` agent enforces the bilingual parity rules.

---

## 2. The Corag Community Voice

The brand voice in [Brand Guide § Brand voice](./BRAND_GUIDE.md#brand-voice) is the source of truth for tone anchors. This section translates that into writing rules.

### 2.1 The four anchors

1. **Warm.** Corag coordinates aid between people who are frequently having a bad time. Copy reads like a knowledgeable neighbour — not a press release, and not a charity appeal.
2. **Verifiable.** Every claim is checkable. Every number has a source. If we cannot back it, it does not ship. That is the project's whole argument, applied to its own writing.
3. **Plurally inclusive.** Default to "we" / "us". Use first-person singular only when a specific author owns the experience being narrated.
4. **Never at the expense of the person receiving.** The coraje is ours. Someone receiving aid is a neighbour, not the backdrop for another person's virtue.

### 2.2 What the voice sounds like

- **Authority comes from the mechanism**, not from adjectives. "The evidence is reviewed before it is published" beats "we are deeply committed to transparency."
- **Sentence rhythm is varied.** Short openers next to longer explanatory sentences. Avoid uniform length.
- **Strategic em-dash asides** for mid-thought corrections — "Not a promise. A receipt." — and parenthetical thoughts.
- **Limits get stated.** Naming what is not settled yet is better copy than an evasion, and it is what makes the settled parts believable.
- **Specificity over abstraction.** A named responsable, a dated delivery, a figure with a source.
- **Dry, self-aware humour**, used sparingly and never near somebody's hardship.

### 2.3 What the voice never does

- Hides uncertainty
- Exaggerates accomplishments
- Blames specific community members in public
- Uses marketing language in the body of an article
- Claims false modesty
- Uses voseo in Spanish (`tenés`, `podés`, `sabés` — always tuteo: `tienes`, `puedes`, `sabes`)
- Aims the coraje at the person receiving aid. Nobody needs to be told they are brave for being in a bad situation
- Publishes a number it cannot back
- Uses somebody's hardship as an emotional lever to produce a donation

### 2.4 Author-mode flex

The voice anchors stay constant; the register flexes by content type:

| Mode | Subject | Voice flex | Example opening |
|---|---|---|---|
| **Institutional page** | How the model works, what gets published, the limits | Organizational plural; declarative; the mechanism first | "Corag holds nobody's money. It connects the person who needs with the person who can, puts a named responsable in between, and publishes the account afterwards." |
| **Practical guide (blog)** | How to verify, how to donate, how to start | Second person; concrete steps; the friction named honestly | "Recibes una solicitud de donación por redes. La causa parece urgente. Antes de transferir, una alarma pregunta: ¿esto es real?" |
| **Explainer (blog)** | A definition or a distinction people get wrong | Declarative; one idea per section; the uncomfortable version first | "Impacto social es el cambio sostenible, medible y directo. Si falta cualquiera de los tres, lo que tienes es actividad social." |
| **Field report** | What a delivery actually involved | Plural; dated; evidence-linked; no adjectives doing the work of facts | "El frente del Eje Cafetero cerró la semana con 40 mercados entregados. La evidencia está publicada por entrega." |
| **Technical note** | Integration, the API, how the site is built | Direct, developer-to-developer; states what is not ready | "Many interfaces, one network of data. No keys, no registration — in an emergency the paperwork is the enemy." |
| **Policy** | Conduct, governance, privacy | Plain, enforceable sentences; no legalese padding | "No presentar evidencia es la falta más grave, porque rompe exactamente aquello que hace verificable a Corag." |

When the **byline** is a single author, first-person singular is fine. When it is
*Equipo Corag*, default to plural and avoid sentences that need an embodied "I".

### 2.5 Spanish is the primary language

Spanish is the primary language of the community. English is a first-class international rendition.

- **Write Spanish first when possible** — translate to English second. The Spanish version should not feel like a translation.
- **Local color belongs in personal asides**, not in broad claims. Colombian phrasings (`la jugada`, `nos quedamos un rato`) are great in scene-setting; they weaken arguments addressed to a global audience. See §8 for specifics.
- **Universal Spanish** (LATAM, Spain, US Spanish-speaking) for headlines and thesis statements. Regional flavor for narrative.
- **Tuteo only** (`tú puedes`, `tienes`), never voseo (`vos podés`, `tenés`).

---

## 3. AI Slop Patterns to AVOID

| Pattern | Example (BAD) | Example (GOOD) |
|---------|---------------|-----------------|
| Over-polishing | "That simplicity wasn't a limitation — it was the web's greatest feature. The barrier to entry was low. The feedback loop was instant." | "It worked. No bundlers, no transpilers, no configuration ritual before you could render Hello World." |
| Data obsession | 5 subsections of survey citations with tables: State of JS, Rising Stars, Stack Overflow, Aggregate Picture | "The surveys all point the same way: 88% retention. That's rare in JavaScript land." |
| Structural regularity | Every post: Hook > Problem > Solution > Data > Conclusion. Every section: Statement > Explanation > Code > Transition | Vary structure: sometimes code first, sometimes a question, sometimes a 2-sentence section |
| No failure narratives | "Corag has always worked smoothly." | "El primer frente se coordinó por WhatsApp y perdimos dos entregas por duplicado. Por eso existe el mapa." |
| Length explosion | 5,000–10,000 word posts covering every angle | 2,500–4,000 words. Cut redundant evidence, merge similar sections |
| AI vocabulary | "genuinely," "comprehensive," "this is where X shines," "radical premise," "beautifully simple" | "actually," "real," "this is where they win," "simple bet," "small" |
| Series recap dump | "In chapter one I did X. In chapter two I did Y. In chapter three I did Z." | Open with the new chapter's own hook. Reference prior chapters only when directly relevant. The series navigation shows the full list. |
| Bridge / teaser sections | "## The Bridge to Chapter 7" — long preview of what's next | End each chapter on its own conclusion. A short forward-looking sentence is fine; a multi-paragraph teaser is not. |
| Excessive cross-references | "In chapter three I covered X. In chapter six I mentioned Y. As I explained in chapter one..." | Weave context naturally: state the fact, optionally link it. Each post should stand on its own. |
| Corporate speak | "Corag is a leading-edge synergistic ecosystem revolutionizing social impact." | "Corag conecta a quien necesita con quien puede, y publica la evidencia de cada entrega." |
| Hype punctuation | "¡Postula ya — cupos limitados!" / "Apply now — limited spots!!!" | "Postula como ponente. Cierre el 30 de abril." / "Apply by April 30." |

---

## 4. Humanization Patterns to INCLUDE

- At least 1 failure or struggle per post (something that went wrong, took too long, or surprised the author)
- At least 2 tangents or asides (em-dash interruptions, parenthetical thoughts)
- Mix of sentence lengths (some 5-word, some 30-word)
- At least 1 moment of uncertainty ("I'm not sure," "looking back," "honestly," "honestamente")
- Personal specifics (names, dates, venues, project names, version numbers, attendance counts)
- Rough transitions (not every section needs a smooth bridge)
- At least 1 opinion stated without evidence ("I think," "in my experience," "creo que," "en mi experiencia")
- Where appropriate, an operational anchor ("Nos pasó en el frente del Eje Cafetero…", "The first time we published a receipt…")

---

## 5. No Placeholder Content (MANDATORY)

**Published posts must NEVER contain placeholder text.** Placeholders like `[AUTHOR: …]`, `[TODO: …]`, `[TBD]`, `[FIXME]`, or any bracketed instruction to "fill in later" destroy credibility.

- Replace placeholders with real content or remove the section entirely
- Run the grep below before publishing

```bash
grep -rn '\[AUTHOR:\|\[AUTOR:\|\[TODO:\|\[TBD\]\|\[FIXME\]' src/content/
```

Expected: zero matches. If any match is found, fix before committing.

---

## 6. Pre-Publish Checklist

```
[ ] Does the post include at least 1 failure or struggle?
[ ] Is there at least 1 tangent or aside?
[ ] Are there moments of uncertainty or "I think"?
[ ] Is the data-to-opinion ratio balanced? (not stat > stat > stat)
[ ] Does the structure differ from the last 3 posts?
[ ] Is the word count under 5000? (or justified if longer)
[ ] Would the opening paragraph make sense as a text to a friend?
[ ] Read it aloud — does it sound like a community member talking, or a press release?
[ ] Does every section have at least some sentence length variety?
[ ] Is there at least 1 sentence that starts with "Honestly" / "Honestamente" or "I think" / "Creo que"?
[ ] Spanish content uses tuteo (tú), not voseo (vos)?
[ ] If byline is "Corag" (org voice), does the post avoid first-person-singular sentences that require an embodied "I"?
[ ] If byline is a single author, are community-attributed claims clearly marked as theirs?
[ ] Every figure in the piece is one we can back, and no organization is named as trustworthy without our having verified it?
```
---

## 7. AI Vocabulary Blocklist

Words and phrases to search for and replace before publishing:

| Phrase | Replace with |
|--------|-------------|
| "In the ever-evolving world of…" | Cut entirely |
| "The answer is clear:" | Just state the answer |
| "This is where X shines" | "this is where they win" or state the advantage |
| "leveraging" / "harnessing" | "using" |
| "revolutionary" / "game-changer" | Cut or be specific about what changed |
| "genuinely" (as intensifier) | "actually" or "real" or cut |
| "comprehensive" | Use specific count or cut |
| "best-in-class" | "best free option" or be specific |
| "radical premise" | "simple bet" or "obvious idea" |
| "beautifully simple" | "small" or "clean" |
| "worth highlighting" / "worth calling out" | Just state the thing |
| "the key insight" / "the key takeaway" | State the insight directly |
| "One of the key architectural decisions" | Just describe the decision |
| "It's like a law of…" | Cut forced metaphors |
| "X with superpowers" | Describe the actual capabilities |
| "What makes this X remarkable" | Just state the facts |
| "genuine architectural advantage" | "real advantage" |
| Three-part negation ("No X. No Y. No Z.") | Use 2-part, or a single sentence |
| "What excites me most about X isn't just Y. It's what they represent:" | "What I like about this stack isn't the benchmarks. It's the direction." |
| "I am particularly pleased with" | Cut — just show the thing |
| "ecosistema vanguardista" / "synergistic ecosystem" | Cut or replace with concrete description |
| "redefiniendo los límites" / "redefining the limits" | Cut |

### Quick search command

```bash
grep -rn 'genuinely\|comprehensive\|best-in-class\|beautifully\|radical premise\|worth highlighting\|worth calling out\|key insight\|key takeaway\|this is where.*shines\|game-changer\|revolutionary\|leveraging\|harnessing' src/content/blog/en/
grep -rn 'vanguardista\|sinérgico\|sinergico\|redefin' src/content/blog/es/
```

---

## 8. Voice for Accessible Technical Writing

**Principle:** Every Corag post is technical by default, but the voice should let anyone follow along — not only a reader who already knows the domain. This section covers vocabulary and register moves that keep the voice approachable without softening the argument.

> For the full refinement patterns (describe-before-name, "Traducción:" bridges, concrete analogies, narrative openers, etc.), see **[Writing Craft Guide § 15 — Making technical content accessible](./WRITING_CRAFT_GUIDE.md#making-technical-content-accessible-from-the-agentic-web-refinement)**. That section has before/after examples. This section covers the **voice** side of the same problem.

### 8.1 Avoid regional slang in broad claims

Colombian / Caribbean colloquialisms are great in personal asides ("nos la pegó", "la jugada fue") but weaken broad claims where the reader expects precision. Use universal verbs when the sentence is making a case, not telling a personal story.

| Avoid (regional) | Prefer (universal) |
|------------------|--------------------|
| "se va a pegar" / "se pegan" (meaning *catch on, take hold*) | "va a funcionar", "se va a imponer", "prospera", "prende" |
| "el balde completo de…" (as intensifier) | "el bloque completo de…", "toda la categoría de…" |
| "cuaja" (works in some contexts, regional in others) | "funciona", "se consolida" |
| "nos la pegaron" (as "they succeeded") | "les salió", "funcionó" |

**Rule of thumb:** if the sentence is a diagnosis or an argument, the verb should be one a Spanish-speaking reader from any country can parse without looking up. Save the regional color for personal asides.

### 8.2 No Spanglish in headings or claims

A single English word dropped into a Spanish sentence reads as jargon-theatre. It's especially jarring in headings.

- **Bad**: `## 6. Los estándares: este es el turn real de la semana` — "turn" mid-Spanish sentence.
- **Good**: `## 6. Los estándares: aquí la semana da el giro más interesante` — same meaning, fully Spanish.

Exceptions: brand names, product names, technical terms without a clean Spanish equivalent (MCP, OAuth, RFC, webhook, lightning talk). These are accepted.

### 8.3 Prefer universal intensifiers over regional ones

| Avoid | Prefer |
|-------|--------|
| "el balde completo" | "el bloque completo", "toda la categoría" |
| "full" (en español) | "al máximo", "completo", "en su totalidad" |
| "cabal" (algunas regiones) | "completo", "entero" |

### 8.4 Specific subjects in closers

Closers that rely on abstractions ("la web", "el ecosistema", "la industria", "the tech industry") land flat because there's nobody accountable in the sentence. Replace with a specific collective that includes the reader — and use first-person plural when it's honest.

- **Abstract**: *"gane o pierda, la web queda mejor."*
- **Concrete**: *"gane o pierda, los que construimos en la web salimos ganando."*

The concrete version puts the reader in the sentence. For Corag, the natural collective is "quienes coordinamos" or "quienes aportan", never an abstract "el sector".

### 8.5 Bridge jargon with one familiar anchor, not three

The temptation when a term is unfamiliar is to explain it at length. Don't. Pair it with **one** well-known reference and move on.

- **Too much**: *"Huffman coding — a lossless compression scheme invented in 1952 by David Huffman at MIT, based on variable-length codes derived from symbol frequency distributions — applied to the model's weights."*
- **Right**: *"Huffman coding — the same lossless trick a `.zip` file uses — applied to the model's weights."*

One em-dash aside. One familiar anchor (`.zip`, `HTTPS`, `DNS`, `HTTP`, `HTML`). The reader learns enough to keep reading without feeling quizzed.

### 8.6 Signal the translation

When you follow a dense technical paragraph with a plain-language restatement, mark it explicitly. `Traducción:` / `Translation:` as a sentence opener tells scanning readers "here's the takeaway."

- **Example**: *"Managed OAuth for Access y los nuevos formatos de tokens le dan a los agentes credenciales reales y revocables. Cloudflare Mesh les da una red privada… **Traducción: el agente ya puede entrar como un usuario más, con permisos auditables.**"*

Use sparingly — once per major section at most. If you need it after every paragraph, the paragraphs are too dense.

### 8.7 Accessibility does not mean dumbing down

The goal is not to remove technical substance. It's to make sure a reader who doesn't already know the term can still follow the argument. Keep the specs, keep the RFC numbers, keep the precise claims — but around each dense beat, leave a breadcrumb that a non-specialist can follow.

**Pre-publish check for this section:**

- [ ] Does the post have at least one concrete analogy per major technical term?
- [ ] Is there at least one "Traducción:" / "Translation:" bridge after the densest section?
- [ ] Are headings fully in their target language (no Spanglish)?
- [ ] Does the closer use a specific subject (not "la web" / "the ecosystem" / "the industry")?
- [ ] If a reader skimmed only the first sentence of each paragraph, would they still get the argument?

---

## 9. Content-Mode Specifics

The voice rules apply everywhere. These are the adaptations per surface.

### 9.1 Institutional pages (`InstitutionalPageCopy` in the locale files)

The seven pages under "How Corag works" explain the model. They exist to be
quoted, so:

- **Answer in the first two paragraphs.** An answer in section four does not get
  cited by anything, human or machine.
- **Lead with the mechanism, not the intention.** "The evidence goes through
  administrative review before publication" beats "we take transparency very
  seriously."
- **State the limits in their own section.** `/transparency` has "what is not
  settled yet", stating the windows and the appeals process that are still
  being defined. That section is load-bearing, not a disclaimer.
- **Open a page about danger with the warning.** `/emergencies` leads with
  "Corag is not an emergency service" before anything else, because someone
  arriving in a crisis reads the first block and nothing more.
- **Descriptions land in 130–160 characters** per language and are concrete.

### 9.2 Blog posts (`src/content/blog/{es,en}/`)

- **One question per post.** Two posts half-answering the same question compete
  with each other for the same reader.
- **Real headings.** A run of fifteen paragraphs with no `##` is not a long-form
  article, it is a wall.
- **Lists where the source enumerates.** "El primer indicador… el segundo
  indicador…" is a list pretending to be prose.
- **Every figure is one we can back.** If a case study needs numbers we do not
  have, describe the shape of the intervention instead and say so.
- **Close on something Corag actually does.** Not a channel we do not run, not a
  podcast that does not exist, not a promise we have not built.
- **Both languages, same English slug, same date.** The English version is a
  real translation, not the Spanish with words swapped.

### 9.3 Policy pages (`src/content/pages/{es,en}/`)

`conduct`, `governance` and `contributing` are content files rendered as live
pages. Editing them changes the site.

- **Enforceable sentences, no legalese padding.** "No presentar evidencia es la
  falta más grave" is a rule. "We strive to maintain the highest standards" is
  not.
- **Say what is undefined.** A governance document that pretends every process
  is settled is less trustworthy than one that names the gaps.
- **Never write a rule you would not apply to a partner organization.** The
  moment a policy has exceptions for allies, it stops being a policy.

### 9.4 Forms copy

- **Say what happens after they press send.** How it is treated, who sees it,
  roughly when they hear back.
- **The conduct form states the anonymity guarantee in the form itself**, not in
  a linked policy. If anonymity is chosen, no name or email is stored — that is
  worth saying where the decision is made.
- **Route urgency out.** Any form that could receive a crisis message says, in
  the form, that this is not an emergency service and points at the right place.

## 10. References

- **[Writing Craft Guide](./WRITING_CRAFT_GUIDE.md)** — narrative structure, fact verification, figure markup, refinement patterns, case studies.
- **[Brand Guide](./BRAND_GUIDE.md)** — colors, typography, logo, visual identity. Voice rules in §6.
- **[Standards Guide](./STANDARDS.md)** — orthography rules, import order, project-level standards.
- **[I18N Guide](./I18N_GUIDE.md)** — full multilingual content rules.
- **[Blog Posts Feature Guide](./features/BLOG_POSTS.md)** — file naming, frontmatter schema, hero layouts.
- **[Authors Feature Guide](./features/AUTHORS.md)** — multi-author support and the `authors` collection.
- **[Content Writer Agent](../.agents/agents/content-writer.md)** — the agent that uses this guide.
- **[add-blog-post skill](../.agents/skills/add-blog-post/SKILL.md)** — the scaffolding skill for new posts.

---

**Last updated:** 2026-08-08
**Origin:** Distilled from the Corag brand manual's voice section, the messaging platform in [MESSAGING.md](./MESSAGING.md), and the editorial decisions taken while migrating the blog archive — chiefly that an unverifiable figure never ships.
