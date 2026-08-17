---
version: "0.1"
status: normative
section: 5
order: 5
title: Identificadores
---

# §5 — Identificadores

## §5.1 Identidad del registro (REQUIRED en 0.1)

`{publisher_id}:{local_id}`.

- El `publisher_id` lo asigna el registro una sola vez (revisado por pull
  request, legible por personas); el `local_id` es el que ya usa la base de
  datos del publicador (entero, UUID, hexadecimal — todos conformes, sin
  cambios). Único a nivel global con **cero coordinación**.
- Los identificadores MUST ser estables a través de las ediciones; MUST NOT
  incrustar datos personales; un solo sistema de identificadores por entidad y
  por publicador; y **nunca se acuñan en el espacio de nombres de otro
  publicador** (la API de escritura responde 409 — §4.2).

## §5.2 Identidad del lugar (aplazada a 0.2)

Se *afirma* mediante `same_as[]` (identificadores absolutos, de un solo salto,
no autoritativos) más `merged_into` para la sustitución dentro de un mismo
publicador. Un índice de lugares curado y acotado por municipio (prefijado con
DIVIPOLA y legible por personas — por ejemplo la forma `CO-RIS-PER-ACOPIO-0007`
que se usa institucionalmente, mapeada 1:1 al esquema `co-66001-…`) entra al
registro **solo después de que existan agrupaciones reales**. Nada de esto
cambia la identidad del registro.

## §5.3 Supervivencia

Los identificadores siguen siendo referencias válidas después de que un
publicador cierre (§7.4): un `publisher_id` nunca se reasigna, ni siquiera
después de archivarse.
