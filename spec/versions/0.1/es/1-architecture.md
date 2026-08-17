---
version: "0.1"
status: normative
section: 1
order: 1
title: Arquitectura — la escalera de conformidad
---

# §1 — Arquitectura: la escalera de conformidad

El protocolo es una **escalera, no una puerta**. Cada nivel es una clase de
membresía respetada; cada peldaño hacia arriba habilita más del valor de la
red. Los niveles son acumulativos.

## §1.1 Los niveles

| Nivel | Nombre | Requisitos (resumen) | Insignia | Esfuerzo típico |
|---|---|---|---|---|
| **L0** | **Listada** | Aparece en el registro con una entrada revisada: URL canónica, alias declarados, dominios de entidad, política de rastreo y reutilización. | `listed` | Un PR, minutos |
| **L1** | **Enlazada** | Publica el **manifiesto** (§2) con identidad, objetivo de conformidad, patrón de `public_url`, licencia, `permitted_use` y contacto institucional. Enlaza hacia sus pares. | `linked` | ≤ 1 hora (un archivo JSON estático) |
| **L2** | **Publica** | Sirve al menos un **feed de lugares** conforme (§3) que pase el validador en el perfil `Core`. | `publishes` | **Una tarde** (aplicaciones pequeñas); días (medianas) |
| **L3** | **Sirve y consume** | Sirve la **API de lectura** (§4.1) *o* feeds refrescados en vivo con señales de sincronización (§4.4); **consume** al menos un feed de un par bajo las reglas de consumo (§4.3). | `interop` | Días |
| **L4** | **Federa** | Acepta **escrituras** (§4.2) con idempotencia por `source`+`external_id`; opcionalmente expone MCP (§4.5). | `federates` | Según la aplicación |
| — | **Solo directorio** | Para aplicaciones cuyos registros son irreduciblemente personales, o que eligen no publicar: L0/L1 para siempre, dicho con claridad y **respetado**. | `listed` / `linked` | — |
| — | **Solo enlace saliente** | Aplicaciones del dominio de personas: techo L0/L1 **por la regla §7.1**, no por elección. | `listed` | — |

## §1.2 Precondiciones para L2 y superiores

Observadas como fallas reales en producción (la «trampa del descubrimiento»):

- Un `robots.txt` real (HTTP 200, `text/plain`).
- La ruta del manifiesto **excluida de los catch-all de las SPA**. El
  validador trata `200 + text/html` en una ruta de descubrimiento como
  *ausente* (la regla del soft-404), usando la igualdad de tamaño en bytes
  contra `/` como discriminante.

## §1.3 La rampa de entrada HXL/CSV (por debajo de L2)

Una hoja de cálculo etiquetada con HXL en una URL estable es una **entrada de
generación** aceptada: las herramientas de conversión (la skill o el modo
`convert` del validador) producen a partir de ella el feed JSON conforme. Un
solo esquema canónico sigue rigiendo (§3.2); la conformidad se mide sobre el
**feed producido**. El conversor MUST descartar las columnas de contacto
(§7.2) salvo que estén declaradas como institucionales.

## §1.4 Restricción de diseño: el listón de la tarde

El piso de «publica datos» es deliberadamente **una tarde de trabajo con
exactamente una decisión humana** (la compuerta de datos personales). Todo
cambio normativo que suba ese listón requiere un RFC que nombre el costo de
forma explícita (ver el Apéndice A para el recorrido contra el que está
calibrado).
