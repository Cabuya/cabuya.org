# Contributing to cabuya.org

*(Español más abajo — [ir a la versión en español](#contribuir-a-cabuyaorg).)*

Thank you for helping build the Cabuya Protocol. This repository holds the
website, the normative spec (`spec/`), the publisher registry (`registry/`)
and the conformance validator (`packages/validator/`). All of it is open
source and all of it takes contributions.

## Ground rules

1. **A first PR gets a review, not a redesign.** We review what you sent;
   we don't rewrite your approach in the comments. Maintainers aim to give a
   first response within **48 hours**.
2. **Rule-0 applies to every content change:** no figure we cannot back with a
   named source, no endorsement we cannot maintain, no CTA to a channel that
   does not exist. When something isn't ready, the copy says so.
3. **Zero PII, everywhere** — including fixtures, examples and docs. Contact
   values never appear in this repository; org-level role addresses published
   by their own organizations are the only exception.
4. **Conformance is measured, never declared.** Nothing you write may claim a
   conformance level the validator has not measured.

## Developer Certificate of Origin (DCO)

Every commit must be signed off:

```bash
git commit -s -m "type(scope): description"
```

The `-s` flag adds a `Signed-off-by:` line certifying you have the right to
submit the work under this repo's licenses (the
[Developer Certificate of Origin](https://developercertificate.org/)). It is
not a cryptographic signature and takes no setup — just remember the `-s`. A
bot checks it on every PR; a missing sign-off is the most common reason a
first PR fails CI, and it's fixed with `git commit --amend -s && git push -f`.

## Commits and branches

- **Conventional commits:** `type(scope): description` — types `feat`, `fix`,
  `docs`, `content`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`;
  English, imperative mood.
- Branch from `main`, open a PR against `main`. Keep PRs focused — one
  concern per PR.

## Running the checks locally

```bash
pnpm install
pnpm run biome:check     # lint + format
pnpm run astro:check     # types
pnpm run test            # unit tests
pnpm run build           # full build
# content gates
pnpm run md:check && pnpm run lang:check && pnpm run seo:check \
  && pnpm run parity:check && pnpm run redirects:check
```

The PR template lists which gates apply to which kind of change.

## Where to contribute

| I want to… | Start at |
|---|---|
| Fix a bug or improve the site | An issue, or a straight PR for small fixes |
| Propose a change to the **protocol** | An `rfc` issue — normative changes go through the RFC process, never a drive-by PR to `spec/` |
| Add or correct a **registry** entry | A `registry entry` issue or a PR to `registry/publishers/` |
| Implement a **validator check** | `good-first-issue:check` issues — each is fully specified (id, severity, message, fixture) |
| Translate | `good-first-issue:translation` issues |

---

# Contribuir a cabuya.org

Gracias por ayudar a construir el Protocolo Cabuya. Este repositorio contiene
el sitio web, la especificación normativa (`spec/`), el registro de
publicadores (`registry/`) y el validador de conformidad
(`packages/validator/`). Todo es open source y todo recibe contribuciones.

## Reglas de base

1. **Un primer PR recibe una revisión, no un rediseño.** Revisamos lo que
   enviaste; no reescribimos tu enfoque en los comentarios. El objetivo de
   primera respuesta es **48 horas**.
2. **La Regla-0 aplica a todo cambio de contenido:** ninguna cifra sin fuente
   citable, ningún aval que no podamos sostener, ningún llamado a un canal que
   no existe. Cuando algo no está listo, el texto lo dice.
3. **Cero datos personales**, incluso en fixtures, ejemplos y documentación.
   Los valores de contacto nunca aparecen en este repositorio; la única
   excepción son direcciones institucionales publicadas por su propia
   organización.
4. **La conformidad se mide, nunca se declara.** Nada de lo que escribas puede
   afirmar un nivel de conformidad que el validador no haya medido.

## Certificado de Origen del Desarrollador (DCO)

Cada commit debe llevar firma:

```bash
git commit -s -m "type(scope): descripción"
```

La opción `-s` añade una línea `Signed-off-by:` que certifica que tienes
derecho a aportar ese trabajo bajo las licencias del repositorio. No es una
firma criptográfica y no requiere configuración — solo recuerda la `-s`. Un
bot lo verifica en cada PR; si lo olvidaste:
`git commit --amend -s && git push -f`.

## Commits, ramas y verificaciones

Commits convencionales en inglés (`type(scope): description`), rama desde
`main`, PR hacia `main`, un asunto por PR. Los comandos de verificación local
están en la sección en inglés — son los mismos.

## Dónde contribuir

Cambios **normativos** al protocolo van por el proceso RFC (abre un issue tipo
`rfc`), nunca por un PR directo a `spec/`. Entradas del **registro**: issue
`registry entry` o PR a `registry/publishers/`. Los issues
`good-first-issue:*` están completamente especificados para que tu primera
contribución sea un buen rato, no una arqueología.
