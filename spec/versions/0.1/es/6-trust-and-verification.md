---
version: "0.1"
status: normative
section: 6
order: 6
title: Confianza y verificación
---

# §6 — Confianza y verificación

## §6.1 El bloque de verificación (Core)

Tres equipos del ecosistema lo inventaron por separado — la especificación lo
adopta como Core:

- **`last_confirmed_at`** — la **clave es REQUIRED en todos los registros;
  `null` es legal y honesto** («nunca se confirmó»). Omitirla no cumple.
- `confirmed_by` — un **token de rol** (`team` | `volunteer` |
  `official_source` | `partner:{publisher_id}`), nunca el nombre de una
  persona.
- `confirmation_method` — enum cerrado.
- `confirmations_24h`, `contradictions_active`.
- **`last_reported_absent_at`** — la confirmación negativa es de primera
  clase.
- **`updated_at` ≠ `last_confirmed_at`** (CR-1): las semánticas de frescura no
  son intercambiables — **editar no es confirmar**.

## §6.2 Mostrar la obsolescencia

Los consumidores MUST mostrar la antigüedad (§4.3, regla 2). Los publicadores
SHOULD definir `expires_at` en los lugares temporales por naturaleza.

## §6.3 Sin firmas en 0.1

La gestión de llaves es el costo que los equipos de voluntarios fallan de forma
más confiable, y el riesgo dominante del modelo de amenazas (datos de lugares
envenenados) se mitiga en la capa del **registro** (publicadores revisados,
URL canónicas) y en la capa de **escritura** (colas de moderación), no con
firmas por registro.

**Ruta de actualización (v1):** llaves publicadas en el manifiesto más firmas
desprendidas del feed (`{feed-url}.sig`), opcionales por publicador — el sobre
ya lleva `publisher_id`, así que el ancla de confianza existe.

Amenazas consideradas y sus mitigaciones: suplantación del feed (HTTPS más la
URL canónica del registro) · suplantación de identidad (revisión del registro)
· lugares envenenados (cola de moderación, `contradictions_active` y las
comprobaciones de procedencia del validador) · ocupación de identificadores
(la regla de espacio de nombres de §5 y el 409) · daño por datos obsoletos
(mostrar la frescura es obligatorio) · amplificación por agregadores
(preservación de la cadena, §4.3 regla 4).
