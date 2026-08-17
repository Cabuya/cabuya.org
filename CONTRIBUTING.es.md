# Contribuir a cabuya.org

*(In English: [CONTRIBUTING.md](CONTRIBUTING.md).)*

Gracias por ayudar a construir el Protocolo Cabuya. Este repositorio contiene
el sitio web, la especificación normativa (`spec/`), el registro de
publicadores (`registry/`) y el validador de conformidad
(`packages/validator/`). Todo es open source y todo recibe contribuciones.

La persona para la que está pensado este proyecto es alguien que programa como
voluntario, tiene dos horas libres y ya trabaja en una de las aplicaciones de
ayuda que este protocolo intenta conectar. Todo lo de abajo está ordenado
alrededor de esa persona.

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
5. **Nunca debilites ni borres un test para que pase una compuerta.** Si la
   compuerta está mal, arréglala y dilo en el PR. Si está bien, encontró algo.

## Cuatro formas de entrar, más o menos por esfuerzo

### 1. Abre un issue

Algo de la especificación es ambiguo, el mensaje de una verificación está mal,
una página dice algo que no es cierto. **No necesitas traer el arreglo para
reportar el problema.** Los issues más valiosos vienen de quien intentó
implementar algo y se estrelló contra un muro — un muro es evidencia sobre la
especificación, no solo sobre quien la leyó.

### 2. Publica un feed

El camino más corto de lectora a participante. La
[guía rápida](https://cabuya.org/es/developers/quickstart) son dos archivos y
una corrida del validador — una tarde para una aplicación pequeña, que es una
restricción de diseño y no una presunción. No necesitas permiso y no necesitas
avisarle a nadie primero.

### 3. Abre un pull request al registro

Cuando tu feed valide, agrega tu entrada a `registry/publishers/`. Un archivo
JSON, revisado por una persona, integrado. El estado medido llega después,
desde el validador — la entrada es una afirmación sobre quién eres, nunca sobre
cuán conforme eres.

### 4. Súmate al grupo de trabajo

Participa en la discusión de los cambios normativos.
[`GOVERNANCE.md`](GOVERNANCE.md) tiene los requisitos para ser maintainer; el
primero es que tu aplicación publique un feed conforme, porque publicar
califica y el entusiasmo no.

## Buenos primeros issues

El backlog está **poblado de antemano con trabajo bien especificado**, a
propósito. Un tablero de issues vacío intimida por razones que no tienen nada
que ver con la dificultad: le pide a alguien nuevo que invente el trabajo
además de hacerlo.

| Etiqueta | Qué es | Por qué es un buen primer issue |
|---|---|---|
| `good-first-issue:check` | Implementar una verificación del catálogo del validador | Perfectamente acotado — el identificador, la severidad, el mensaje y el caso de prueba ya están especificados. Una función y dos tests. |
| `good-first-issue:stack` | Escribir la guía de implementación para un stack que conoces | Necesita *tu* conocimiento del dominio, no conocimiento del proyecto. Lo más valioso que alguien de afuera puede aportar el primer día. |
| `good-first-issue:translation` | Traducir una sección de la especificación, el mensaje de una verificación o una página | Cualquiera puede revisarlo, y mantiene real la promesa bilingüe en vez de dejarla en aspiración. |
| `good-first-issue:example` | Agregar un ejemplo válido o inválido con un `$comment` que enseñe | Mejora directamente qué tan implementable es el protocolo por un agente. |
| `registry` | Agregar o corregir una entrada de publicador | El camino de menor esfuerzo de lectora a contribuidora. |
| `rfc` | Abrir o discutir un cambio normativo | La rampa de entrada a la gobernanza. |
| `help-wanted:probe` | Reproducir una falla de comportamiento contra un stack real | Convierte un reporte de error en un caso de prueba, que es lo que lo vuelve arreglable. |

`good-first-issue:check` merece el énfasis: cada verificación catalogada que
todavía no está implementada sale como issue abierto con su identificador, su
regla, su severidad y su texto de arreglo ya decididos. No hay nada que
diseñar.

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

**No hay CLA**: no existe una entidad legal a la cual cederle derechos, y la
fricción de un CLA reduce de forma medible justamente las contribuciones de
paso de las que depende este proyecto.

## Commits, ramas e idioma

Commits convencionales en inglés (`type(scope): description`), rama desde
`main`, PR hacia `main`, un asunto por PR.

Escribe en español o en inglés, en el que pienses. **El código, los
comentarios, los mensajes de commit, los identificadores de verificación y las
llaves JSON van en inglés**, porque el protocolo lo lee gente que no comparte
ningún otro idioma. **El contenido público va en los dos**, escrito de forma
nativa en cada uno y no traducido a máquina desde el otro. Un issue en español
recibe respuesta en español.

## Correr las verificaciones localmente

```bash
pnpm install
pnpm run biome:check     # lint y formato
pnpm run astro:check     # tipos
pnpm run test            # tests unitarios
pnpm run build           # build completo
# compuertas de contenido
pnpm run md:check && pnpm run lang:check && pnpm run seo:check \
  && pnpm run parity:check && pnpm run redirects:check
```

La plantilla de PR dice qué compuertas aplican a cada tipo de cambio; la lista
completa de comandos está en
[`docs/DEVELOPMENT_COMMANDS.md`](docs/DEVELOPMENT_COMMANDS.md).

## Dónde contribuir

Los cambios **normativos** al protocolo van por el proceso RFC (abre un issue
tipo `rfc`), nunca por un PR directo a `spec/`. Entradas del **registro**:
issue `registry entry` o PR a `registry/publishers/`. Los issues
`good-first-issue:*` están completamente especificados para que tu primera
contribución sea un buen rato, no una arqueología.

## Código de conducta

[El Contributor Covenant 2.1](CODE_OF_CONDUCT.md), más dos adiciones: los
reportes van a un rol que sostienen maintainers de dos aplicaciones distintas,
nunca a una persona, y un maintainer que sea objeto de un reporte no participa
en atenderlo.
