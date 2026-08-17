---
title: Reglas de consumo
description: Seis reglas para leer el feed de otra aplicación sin hacerle daño a las personas que describe. La mitad del protocolo que se suele olvidar.
section: consuming
order: 0
updated: 2026-08-17
---

Publicar se lleva la atención. Publicar es además la mitad fácil: exportas lo
que ya tienes y, si te equivocas, el validador te lo dice.

Consumir es donde se hace el daño. Quien consume decide qué ve una persona que
está buscando dónde dormir esta noche — cuál registro, de cuándo, de quién, y
si las dos entradas que parecen el mismo albergue son el mismo albergue. Si eso
sale mal no se dispara el validador de nadie. Simplemente alguien camina hasta
un centro de acopio que cerró el martes.

Por eso el protocolo le exige seis cosas a quien consume, y son MUST. Están
escritas en
[§4.3](/es/developers/spec/0.1/4-api-surface#4-3) y se repiten aquí con lo que
cada una está protegiendo de verdad, porque una regla que entiendes es una
regla que vas a seguir cumpliendo dentro de seis meses, cuando el plazo
apriete.

## Las seis reglas

### 1. Atribuir

> Mostrar el publicador de origen en cada registro ajeno.

Verificable por máquina a través de `source.source_id`, y
`attribution_required` en el manifiesto del publicador lo vuelve explícito.

**Qué protege.** Un teléfono que no contesta, una dirección equivocada, un
albergue que rechazó a alguien — son cosas que la gente necesita reportarle a
*alguien*, y ese alguien es quien publicó el registro, no quien lo mostró. Un
agregado sin atribución convierte cada error en tuyo y en arreglable por nadie.

También protege a los publicadores. Un equipo que ve sus datos acreditados en
la app de otro tiene un motivo para seguir publicando. Un equipo que ve su
trabajo absorbido en un montón sin atribuir tiene un motivo para dejar de
hacerlo.

**Autoprueba.** Un test que falla cuando una tarjeta se dibuja sin su sello de
procedencia. No un punto de revisión de código — un test, porque esta es la
regla que se erosiona en silencio en cuanto una pantalla se llena.

### 2. Mostrar la edad

> Dibujar la edad de `last_confirmed_at` — o *sin confirmar* cuando es `null` —
> dondequiera que un registro ajeno pueda mandar a alguien a un lugar.

Pasados siete días, o cuando `contradictions_active > 0`, el registro DEBE
distinguirse visualmente. NO DEBERÍA ocultarse en silencio.

**Qué protege.** La mitad importante es la regla de no ocultar.
[§6.2](/es/developers/spec/0.1/6-trust-and-verification#6-2) lo dice sin
rodeos: la ausencia de datos no es evidencia de cierre. Un registro viejo
mostrado como viejo le permite a alguien decidir llamar antes. Un registro
viejo escondido se ve exactamente igual que un lugar que nunca existió, y la
persona se va más lejos sin razón.

`sin confirmar` tampoco es un estado de falla. Significa que nadie ha vuelto a
verificar, que es la condición honesta de la mayoría de los registros durante
la primera semana de una emergencia, y es más útil que una fecha segura de sí
misma que se copió de `updated_at` cuando alguien corrigió una tilde.

**Autoprueba.** Tres registros de prueba — reciente, de ocho días y `null` — y
una afirmación sobre qué dibuja cada uno.

### 3. No mutar

> Nunca alterar el contenido de un registro ajeno.

Las correcciones y los enriquecimientos viven en *tus* registros, enlazados con
`same_as`.

**Qué protege.** La capacidad del publicador de responder por sus propios
datos. En el momento en que quien consume edita un registro al vuelo, el
registro dice algo que su publicador nunca dijo, y la atribución de la regla 1
se convierte en una mentira con un nombre encima.

Es también lo que hace depurable a la red. Si cada copia de un registro es
idéntica byte a byte a lo que sirvió su publicador, una discrepancia es un bug
en un solo lugar. Si cada consumidor aplica sus propios arreglos, es un bug en
*n* lugares y nadie puede saber en cuál.

**Autoprueba.** A nivel de tipos: el tipo del registro ajeno no tiene setters.

### 4. Preservar cadenas

> Un agregador que republica DEBE conservar intacto el `source{}` original.

Tu propia identidad va en el `publisher_id` del sobre — nunca en la procedencia
del registro.

**Qué protege.** La procedencia a dos saltos. Los agregadores se agregan entre
sí; eso está bien y es lo esperado. Lo que no está bien es que el segundo
agregador parezca el origen de un registro que salió de la hoja de cálculo de
un albergue tres saltos atrás. Las cadenas son la diferencia entre una red y el
teléfono roto.

**Autoprueba.** Un ida y vuelta con datos de prueba: leer un registro,
republicarlo, volverlo a leer y afirmar que `source{}` no cambió.

### 5. Deduplicar por afirmación, no por autoridad

> Agrupar con `same_as` — un salto, no transitivo — más coincidencia de
> dirección plegada de acentos y DIVIPOLA. Nunca cadenas de texto visible.
> Publicar los grupos como registros propios.

**Qué protege.** Lo que vuelve peligrosa a la deduplicación es que es un juicio,
y un juicio publicado como un hecho es una afirmación que hiciste en nombre de
otro. *Colegio San José* e *I.E. San José* pueden ser el mismo edificio o
pueden estar a dos cuadras, y quien consume y los fusiona decidió algo que los
publicadores no decidieron.

Así que fusiona, por supuesto — una app que muestra el mismo albergue cuatro
veces no sirve. Pero publica la fusión como registro *tuyo*, con `same_as`
apuntando a los cuatro que fusionaste, para que el siguiente consumidor pueda
estar en desacuerdo contigo. Un salto y no transitivo por lo mismo: que
`A same_as B` y `B same_as C` no hace que A y C sean el mismo lugar, y una
cerradura transitiva sobre un grafo ruidoso termina fusionando media ciudad.

Nunca cadenas de texto visible, porque *Cra 8 #12-34* y *Carrera 8 No. 12 - 34*
son la misma dirección y *Sede A* son treinta lugares distintos.

**Autoprueba.** Los grupos se publican como registros propios de quien consume
y así queda documentado en la cabecera del código generado.

### 6. Respetar las exclusiones

> Nunca cruzar datos de lugares con fuentes de personas. Nunca traer datos de un
> publicador cuya política declarada se reserva la reutilización.

**Qué protege.** Las dos mitades hablan de lo que el protocolo se niega a
transportar.

La prohibición de cruce
([§7.1](/es/developers/spec/0.1/7-normative-exclusions#7-1)) no se satisface
dejando los campos personales fuera de tu base de datos. Es una prohibición
sobre el *cruce*: una aplicación que tiene datos de lugares y una lista de
personas desaparecidas puede federar sus datos de lugares y no puede combinar
los dos, ni siquiera internamente, ni siquiera para una función que sería útil.
Ese es todo el diseño — un protocolo que no se puede ensamblar en una
herramienta de vigilancia combinando dos conjuntos de datos inofensivos por
separado.

La mitad de la reutilización es más simple y igual de firme. `permitted_use` en
un manifiesto es la respuesta del publicador a *qué se puede hacer con esto*, y
quien lo trae de todos modos decidió que su uso importa más que el
consentimiento del publicador. Construye el rechazo dentro de la capa de red,
no dentro de un documento de políticas: la petición debería ser imposible de
hacer, no meramente desaconsejada.

**Autoprueba.** La capa que trae datos rechaza esos hosts por construcción.

## Cómo se ve consumir bien

[Ayudas Colombia](https://github.com/juanptoror/aqui-ayuda) es la referencia
viva, liberada como código abierto por su autor para este esfuerzo de
integración. Es una aplicación en Vite/React que agrega cinco backends
distintos en una sola vista, y llegó sola a varias de estas reglas antes de que
existiera un protocolo que las exigiera.

Su componente de procedencia le da a cada fuente su propio sello visual — el
color de marca de la fuente, «y un sello dice de quién es el dato, no cómo de
grave es» — y su README es explícito en que esto no es decoración: *si un
teléfono no responde o una dirección está mal, hay que poder saber quién lo
publicó y a quién reclamar.* Eso es la regla 1, descubierta desde el campo y no
desde una especificación. **Un test falla si una tarjeta aparece sin sello o
con el de la fuente equivocada.**

También acierta en la parte más difícil de la regla 2, en un punto al que la
regla no llega del todo. Cuando su API de origen falla, la pantalla lo dice: un
500 nunca se presenta como «no hay nadie pidiendo ayuda». En palabras de su
propio README: *decir que no hay necesidades cuando en realidad no se pudo
preguntar es desinformar en plena emergencia.* Es la misma distinción que traza
el validador entre el código de salida 1 y el 3, y por la misma razón.

El patrón que vale la pena copiar entero: **un hueco sin explicar es peor que
un cero explícito.** Su tablero dibuja los cuatro indicadores haya datos o no,
porque una casilla ausente se lee como «todo bien» y un cero se lee como un
cero.

## Dónde te deja esto

Si estás construyendo un consumidor, el camino honesto más corto es: traer los
datos por una capa que sepa de `permitted_use` y de política de rastreo,
guardar los registros ajenos de forma inmutable, dibujar fuente y edad en cada
tarjeta, y tratar tus fusiones como opiniones tuyas.

Si prefieres que lo haga un agente, la
[skill para agentes](/es/developers/skill) convierte esta página en una lista
de verificación que comprueba contra el código que escribe, con las autopruebas
de arriba.

El [registro](/es/registry) lista quién publica qué, y qué encontró el
validador la última vez en cada feed. Nada de lo que hay ahí es una
recomendación — lee [la nota de la página](/es/registry) antes de tratarlo como
tal.
