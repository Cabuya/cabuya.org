---
title: Perfiles
description: Core es el piso de conformidad y cada campo suyo lo mide el validador; Extended es la profundidad que declaras, feed por feed. Cómo nace un perfil.
section: reference
order: 3
updated: 2026-08-17
---

Un perfil es un conjunto de campos con nombre y URI versionada. Hoy hay dos, y
la diferencia entre ellos no es «básico» y «avanzado» — es **exigido a todos** y
**declarado por ti**.

## Core — el piso

`Core` es lo que significa la conformidad L2: un manifiesto y al menos un feed
de `places` en el que cada registro lleva el conjunto requerido. La lista
completa, con por qué está cada campo, está en
[el documento del perfil](/es/developers/spec/0.1/8-versioning-and-conformance#8-2)
y su fuente es `spec/profiles/core.md`.

El conjunto es corto a propósito. Nueve campos por registro y cinco en el sobre
— lo suficiente para que quien consume pueda atribuir un registro, ubicarlo,
enlazar hacia él y decir de cuándo es, y ni un campo más. Todo lo que quien
consume necesita para comportarse bien bajo las
[reglas de consumo](/es/developers/consume) está en Core; todo lo demás es
opcional.

Hay una propiedad que vale la pena decir aparte, porque es la razón de que el
piso aguante:

> **Todo lo que está en Core es verificable por el validador.**

Esa es la regla editorial de
[§8.2](/es/developers/spec/0.1/8-versioning-and-conformance#8-2) haciendo su
trabajo — *un MUST que un script no puede validar DEBERÍA ser un SHOULD*. Un
requisito que nadie puede medir es un requisito que se vuelve opcional en
silencio, y entonces el piso queda donde cada publicador decidió que estaba.

## Extended — profundidad declarada

`Extended` es Core más la profundidad opcional ya reservada en el esquema:
capacidad y ocupación, resúmenes de necesidades, horarios, medios e
`institutional_contact`.

Dos cosas de él sostienen el diseño:

**Lo declaras por feed**, en `feeds[].profile` del manifiesto. No por
publicador, no globalmente. Un publicador cuyo feed de albergues lleva capacidad
y cuyo feed de centros de acopio no la lleva es un publicador normal, no uno
inconsistente.

**Un campo Extended ausente nunca es una falla de Core.** El validador mide los
campos Extended solo donde los declaraste. Declarar `extended` y luego omitir
`capacity` es un hallazgo; no declararlo en absoluto es simplemente no
afirmarlo.

`institutional_contact` merece su propia advertencia. Son solo números de la
organización, y
[§7.2](/es/developers/spec/0.1/7-normative-exclusions#7-2) sigue vigente dentro
de él: un teléfono personal no se vuelve publicable por ponerlo en un campo
Extended. Ningún perfil relaja jamás una exclusión. Los perfiles agregan
campos; [§7](/es/developers/spec/0.1/7-normative-exclusions) los quita, y quitar
gana.

## Extender antes de que haya un perfil

No necesitas permiso para agregar un campo, y no necesitas esperar.

Las extensiones `x_{publisher}_{field}` siempre son legales, y
[§8.4](/es/developers/spec/0.1/8-versioning-and-conformance#8-4) obliga a quien
consume a preservar los miembros desconocidos y le prohíbe fallar la validación
por ellos. Así que un publicador que necesita *presión del agua en la llave* o
*si la rampa sirve* puede publicarlo mañana, bajo su propio espacio de nombres,
y no se rompe ningún consumidor.

El prefijo del espacio de nombres es lo que vuelve esto seguro. Dos publicadores
que inventan `capacity_note` colisionaron; `x_corag_capacity_note` y
`x_reporteco_capacity_note` no, y esa colisión es justo lo que si no obligaría a
coordinarse antes de que nadie pueda experimentar.

## Cómo una extensión se vuelve un perfil

El camino es deliberadamente lento al principio y rápido al final.

1. **Los publicadores convergen en la práctica.** La gente publica extensiones
   `x_` porque las necesita. Todavía no se propone nada.
2. **Dos o más publicadores publican la misma forma.** Este es el umbral, y es
   un umbral sobre código corriendo, no sobre acuerdos en una reunión. Un
   publicador con una extensión tiene una necesidad local; dos con la misma
   extensión encontraron algo que al protocolo le falta.
3. **Un RFC lo propone** como perfil con nombre en una URI pública versionada, y
   pasa por las reglas estándar de RFC.
4. **Al aceptarse, los campos se mueven** del espacio `x_` al esquema del perfil,
   en el siguiente MINOR.

El mismo principio gobierna la especificación:
[§8.1](/es/developers/spec/0.1/8-versioning-and-conformance#8-1) dice que una
candidata a versión se vuelve normativa solo después de que al menos un
publicador la haya puesto en producción. La especificación nunca le saca ventaja
a quienes la implementan. Un perfil promovido porque parecía buena idea es un
perfil que publica campos que nadie llena, y un esquema lleno de campos
opcionales vacíos le enseña a la gente a ignorar el esquema.

## Qué significa esto en la práctica

Si estás empezando: apunta a Core, ignora Extended y hazte medir. Core es el
trabajo de una tarde para una aplicación pequeña, que es la restricción de
diseño que el protocolo se puso para aguantar
([§1.4](/es/developers/spec/0.1/1-architecture#1-4)).

Si ya tienes profundidad en tus datos: declara `extended` en los feeds que la
llevan, y pon bajo tu espacio `x_` todo lo que el perfil no cubra. No pierdes
nada haciéndolo y construyes el caso para el siguiente perfil.

Si crees que un campo pertenece al protocolo: publícalo primero como extensión.
Después encuentra al otro publicador que lo necesita. Esa conversación es el
RFC.
