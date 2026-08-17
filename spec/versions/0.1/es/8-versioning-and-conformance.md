---
version: "0.1"
status: normative
section: 8
order: 8
title: Versionado y conformidad
---

# §8 — Versionado y conformidad

## §8.1 Versionado

- **SemVer** para la especificación; `version` en todos los sobres; las
  versiones soportadas abarcan como máximo 2 MAJOR; los productores tienen 180
  días ante un salto de MAJOR; los términos obsoletos advierten durante una
  versión y después dan error.
- **Una candidata a versión se vuelve normativa solo después de que al menos
  un publicador la haya puesto en producción públicamente** — la especificación
  nunca se adelanta a quienes la implementan.

## §8.2 Perfiles

- **`Core`**: el manifiesto más un feed `places` conforme con el conjunto de
  campos obligatorios.
- **`Extended`**: capacidad, necesidades, horarios, medios y contacto
  institucional.
- Regla editorial: **un MUST que un script no pueda validar SHOULD ser un
  SHOULD.**

## §8.3 La conformidad se mide

**Conformidad = pasar el validador publicado, nunca autodeclararse** (la
evidencia de producción: registros de adaptadores que *declaran* capacidades
sin implementar — los manifiestos mienten, el comportamiento no). Las insignias
del registro se vuelven a medir de forma programada; los estados son:
`conforming` | `stale` (el validador pasa pero `last_updated` supera 7 × `ttl`)
| `failing` | `unreachable` | `archived`.

## §8.4 Extensibilidad

Los miembros desconocidos MUST conservarse y MUST NOT hacer fallar la
validación; las extensiones con el espacio de nombres
`x_{publisher}_{field}` siempre están permitidas; los conjuntos de extensiones
compartidos se vuelven **Perfiles** versionados en URI públicas.

## §8.5 Reservado para 0.2 (anotado para que los nombres no deriven)

- Entidades: `need`/`offer` (con **`quantity_required`** y
  **`quantity_covered`** — el campo que evita la sobreentrega a puntos ya
  saturados mientras zonas sin atender esperan), `rental_notice` y
  `damage_report` (referido a EDAN).
- **Las alertas referencian CAP** — adoptado oficialmente en Colombia
  (IDEAM/UNGRD) — en vez de cualquier formato inventado; el registro anota los
  endpoints CAP de los publicadores como ciudadanos de primera clase.
- El índice curado de lugares (§5.2).
