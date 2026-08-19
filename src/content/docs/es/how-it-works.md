---
title: Cómo funciona
description: La red de punta a punta — las dos premisas, la copia publicada, cómo viajan los registros con atribución y ubicación, y qué produce instalar la skill.
section: start
order: 1
updated: 2026-08-19
---

Todo lo que hay en esta página se desprende de dos hechos. Dichos una vez, el
resto del protocolo deja de parecer maquinaria y empieza a parecer inevitable.

**Van a existir muchas apps, y está bien.** En cada emergencia los equipos
crean sus propios tableros, mapas y directorios — muchas veces varios para la
misma ciudad. El directorio del ecosistema de 2026 lista veintiuno. La
unificación no va a llegar, y el protocolo no la pide: cada app conserva su
producto, sus usuarios y su base de datos. Lo que cambia es que sus registros
dejan de quedarse encerrados adentro.

**Los datos son delicados.** Estos registros acompañan a personas en su peor
semana. Por eso la capa compartida lleva lugares y hechos — nunca personas.
Sin nombres, sin teléfonos, sin contacto personal: excluidos por una
[prohibición de cruce](/es/developers/spec/0.1/7-normative-exclusions), no por
buenas intenciones.

## La copia publicada

Una app entra a la red publicando dos cosas:

1. **Un manifiesto** en `/.well-known/cabuya.json` — un archivo JSON que dice
   quién eres, qué publicas y bajo qué licencia.
2. **Un feed** — tus registros en el esquema compartido, en una URL que el
   manifiesto declara. **La URL la eliges tú, y un archivo estático y una API
   de lectura son el mismo feed**: la
   [regla de equivalencia](/es/developers/spec/0.1/3-the-feed#3-2) de la
   especificación los hace byte-compatibles registro a registro, así que un
   archivo simple en una URL estable es el piso, no una opción menor.
   `places.json` es un nombre de ejemplo, no una regla.

Nada interno cambia. Tus tablas, tus llaves primarias y tu producto quedan
exactamente como están — el feed es una copia traducida, producida por un
serializador pequeño, y la [guía del modelo de datos](/es/developers/data-model)
muestra cómo organizar una app nueva para que esa traducción salga casi
gratis.

## Cómo viaja un registro

Otra app descarga tu feed y vuelve a mostrar tus registros bajo las
[seis reglas de consumo](/es/developers/consume). Dos de ellas definen lo que
una persona ve en pantalla:

- **La atribución viaja con el registro.** Cada registro lleva su
  `publisher_id` y su propia geografía — `municipality_code`,
  `municipality_text`, `neighborhood_text`, coordenadas y su precisión. Por
  eso la forma canónica en que un consumidor muestra un registro ajeno es:

  > **{nombre}** — por {app que lo publicó} · {municipio}, {barrio}

  Quien mira desde Cali ve un registro de Pereira *y ve que es de Pereira y
  que lo publicó otra app* — la atribución y la ubicación sobreviven cada
  salto.

- **Cada botón de acción lleva al origen.** Cada registro lleva `public_url`:
  la página del propio publicador. Los datos de contacto nunca viajan en los
  feeds, así que los botones del consumidor — «puedo ayudar», «llamar al
  albergue», «detalles» — enlazan a la app dueña del registro. Eso es lo que
  vuelve practicable la regla de no-contacto en lugar de solo prohibitiva: el
  feed mueve el hecho, el origen resuelve la ayuda.

El registro público queda a un lado de todo esto. Lista quién existe y qué
midió el validador; ningún dato pasa por él, y estar listado no es un
respaldo.

## Qué produce instalar la skill para agentes

La [skill para agentes](/es/developers/skill) le enseña el protocolo completo
a un agente de código sin conexión, y acompaña la adopción de tu app.
En concreto, quien adopta termina con:

- `https://tu-app.org/.well-known/cabuya.json` — el manifiesto.
- `https://tu-app.org/cabuya/places.json` — el feed (esa URL de ejemplo, o la
  que prefieras; archivo o endpoint).
- En el repositorio: el cruce de tus columnas existentes al esquema
  compartido y el serializador que produce el feed — propuestos archivo por
  archivo, aprobados por ti; una nota corta en la raíz del repositorio que
  explica la integración a quien la encuentre meses después; y una bitácora
  de avance en `.cabuya/adoption.json`. Esos dos últimos son los únicos
  archivos que la skill escribe por su cuenta, y ambos se pueden borrar.
- El ciclo: ejecuta el [validador](/es/developers/validator) contra tus URLs,
  lee lo que midió, corrige, repite.

Así se ven los dos documentos, recortados (la
[guía rápida](/es/developers/quickstart) lleva ambos completos):

```json
// tu-app.org/.well-known/cabuya.json — el manifiesto
{
  "publisher_id": "example-app",
  "license": "CC-BY-4.0",
  "feeds": [
    { "name": "places", "entity": "place",
      "url": "https://example.org/cabuya/places.json" }
  ]
}
```

```json
// un registro del feed
{
  "name": "Coliseo Municipal",
  "place_kind": "shelter",
  "municipality_text": "Pereira",
  "lifecycle_status": "active",
  "public_url": "https://example.org/places/coliseo"
}
```

Nunca migra tu modelo de datos interno. Si tu app todavía está en el tablero
de dibujo, la [guía del modelo de datos](/es/developers/data-model) es la
forma desde la cual empezar.

## Los niveles, en lenguaje llano

La conformidad la mide el validador, nunca se declara — y los niveles son
clases de membresía, no calificaciones. Una frase por nivel:

- **L0 — Listada.** Tu app aparece en el registro. Un pull request.
- **L1 — Enlazada.** Tus registros enlazan a las páginas de otras apps. Menos
  de una hora.
- **L2 — Publica.** Tu feed está en línea y los demás pueden leerlo. Una
  tarde para una app pequeña.
- **L3 — Sirve y consume.** Además lees los feeds de otras apps y muestras
  sus registros. Días.
- **L4 — Federa.** Lecturas y escrituras fluyen en ambos sentidos. Según la
  app.

Dos clases nunca pasan de L1, a propósito: las apps cuyos registros son
irreduciblemente personales (personas desaparecidas, reunificación — solo
enlace saliente, permanentemente), y las que simplemente eligen no publicar.
Ambas están listadas y ambas son miembros respetados. Quedarse en un nivel es
una posición, no un fracaso.

## Qué lleva el protocolo hoy — y qué está propuesto

La versión 0.1 publica una sola entidad: `place` — albergues, centros de
acopio, hospitales, puntos de agua y comida, y los demás lugares por donde
pasa la ayuda. Los pedidos y ofertas de ayuda con cantidades (`need`/`offer`),
los reportes de daños y la declaración de cobertura del publicador están
**propuestos para la v0.2 en la [RFC 0002](/es/rfcs/0002)** — un borrador en
revisión abierta, no algo que ya puedas publicar. El sitio lo dirá el día que
eso cambie, y no antes.
