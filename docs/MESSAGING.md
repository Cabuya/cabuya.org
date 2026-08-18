# Messaging — the Cabuya narrative and where each beat belongs

> The narrative map for every writer (human or agent) producing cabuya.org
> copy. Voice rules live in [`WRITING_VOICE_GUIDE.md`](./WRITING_VOICE_GUIDE.md);
> this document says **what** we say and **where**. Rule-0 constraints are per
> section and non-negotiable.

---

## 1. The elevator pitch (verbatim — do not paraphrase on first use)

**Español**
> Cabuya es un formato abierto para que las apps de ayuda publiquen y lean los
> mismos datos: puntos de acopio, necesidades, capacidades y entregas.
> Cualquier equipo puede implementarlo en una tarde, y nadie tiene que pedirle
> permiso a nadie.

**English**
> Cabuya is an open format that lets aid apps publish and read the same data:
> collection points, needs, capacities and deliveries. Any team can implement
> it in an afternoon, and nobody has to ask anyone for permission.

## 2. The founding story (the one-breath version)

*La cabuya es la fibra con la que se amarra lo que nadie puede cargar solo.
Muchos hilos que por separado no aguantan nada, pero juntos cargan lo que sea.
Cada app es un hilo y el protocolo es la cuerda.*

English rendition: *Cabuya is the fibre you use to tie down what nobody can
carry alone. Many threads that hold nothing on their own — twisted together,
they carry anything. Each app is a thread; the protocol is the rope.*

Supporting facts the story may carry (each checkable, per Rule-0):

- The word is Colombian and common property; it names the fibre of the fique
  plant; it does not expire when an emergency ends and belongs to no app.
- Colombia is among the world's largest fique producers (cite when used).
- The origin: Colombia's August 2026 seismic emergency produced 20+
  independently built response platforms that could not read each other's
  data. (Citable specifics: `docs/context/DECISIONS.md` M7 and the mesa
  técnica report — always with the named source.)

**Placement rule for origin-story vocabulary:** *terremoto, sismo, emergencia,
Pereira, Eje Cafetero, Colombia* belong in the **history/origin** sections,
where they are true and age well — never in taglines, product names, or the
brand's self-description. The protocol is from Colombia; it is not "the
Colombian standard" (nobody appointed us).

## 3. The narrative beats and their owners

Each claim has exactly one owning surface. Other pages may reference it, but
the full argument lives in one place — that is how the site stays consistent.

| Beat | The claim | Owner | Rule-0 constraint |
|---|---|---|---|
| The pitch | What Cabuya is, in two sentences | Landing hero | No adoption count until the registry proves it per-app with a timestamp |
| The two doors | Start now (`/start`) or understand it first (`/#how-it-works`) | Landing hero CTAs | Both targets must exist and say nothing the pack has not shipped |
| The guided start | Install, say `/cabuya`, the agent plans and runs the adoption | `/start` | Quotes only commands proven in the pack's release transcript; the team's own methodology outranks DWP; DWP offered, never required; the PII decision stays human |
| «Crecemos juntos» | Many weak feeds, twisted together, carry a load none carries alone — and the apps *feed each other* | Landing thesis section | Stated as intent, never as achieved outcome |
| How it works | Manifest → feed → validator → registry | Landing four-boxes | Links to the ladder, not a marketing funnel |
| The ladder | Five measured levels; two respected non-publishing classes | Landing ladder section + `/developers/spec/0.1/1-architecture` | Directory-only and link-out-only shown as **membership classes**, not failures |
| The network | Who publishes what, with measured status | `/registry` (landing renders a teaser) | Only publishers with a registry entry appear; `proposed` rendered as proposed |
| Who is in | Working-group participants who opted in | Landing signatories section | **Absent, not empty**, until a written opt-in exists; nobody is named without one |
| The afternoon | Implementation ≈ one afternoon, one human decision | `/developers/quickstart` | "Five minutes" is only the copy-paste static path; the real mapping is an afternoon — say both |
| Measured, never declared | Conformance = passing the published validator | `/developers/validator` + the trademark page | Never the word *certificado/certified* |
| The exclusions | Person-level data never federates; contact never travels | `/developers/spec/0.1/7-normative-exclusions` (FAQ summarizes) | Official channels (Cruz Roja RCF, Registro Único/UNGRD) are the link-out, named exactly |
| Fraud countermeasure | A verified registry of legitimate points serves the public | `/registry` + institutional copy | Framed as utility, citing the mesa técnica report — never as an accusation of any app |
| The long horizon | Emergency network → standard → regional ecosystem | Landing horizon section | Explicitly labelled as ambition |
| Governance | Council model, RFC process, escape hatches, wind-down | `/governance` | Never implies an unseated body exists |
| The skill | Install it and your agent knows the protocol | `/developers/skill` | The claim is backed by the published acceptance test — link it |

## 4. Message discipline by audience

- **To developers:** lead with the artifact (a file, a command, a green
  check), never with the mission statement. The mission is one link away.
- **To institutions:** lead with the verified-registry utility and the
  official-channels convergence; the vocabulary is *registro verificado,
  puntos legítimos, canales oficiales* — measured, concrete, zero heroics.
- **To adopters abroad:** lead with the method's portability — the spec is
  CC0, the governance is documented, the origin is Colombian and the design
  is not Colombia-locked (event-scoped registry, `es` baseline + localized
  strings).

## 5. Approved phrasings (use these; don't improvise new ones)

| Concept | ES | EN |
|---|---|---|
| The badge | «Compatible con Cabuya 1.0» | "Cabuya 1.0 compatible" |
| Measured conformance | «La conformidad se mide, nunca se declara.» | "Conformance is measured, never declared." |
| Registry disclaimer | «Aparecer en el registro no es un aval.» | "Inclusion is not endorsement." |
| The exclusion | «Los datos de personas no viajan por el protocolo. Nunca.» | "Person-level data never travels through the protocol. Ever." |
| The floor | «Una tarde de trabajo. Una sola decisión humana.» | "An afternoon of work. Exactly one human decision." |
| Feed possessive | «un feed Cabuya» (never «el feed de Cabuya») | "a Cabuya feed" |

## 6. Banned vocabulary (enforced — see WRITING_VOICE_GUIDE for the full lists)

Hype register (*revolucionario, disruptivo, líder, definitivo, empoderar,
seamless, game-changer…*) · savior register (*salvamos vidas, héroes,
beneficiarios, los más vulnerables as a label, manos que ayudan…*) ·
unbacked claims (*"las 20 apps usan Cabuya", "el estándar de ayuda de
Colombia", certificado…*) · AI-slop scaffolding (*"En un mundo donde…", "No
es solo X, es Y", "imagina un futuro donde"…*).

## 7. Quoting people

Team members' and adopters' words (e.g. an app creator's message about
integration) may be quoted **only with their explicit permission**, attributed
the way they ask. Without permission: paraphrase the idea without attribution.
This applies to the founder's own team messages too — ask before quoting.
