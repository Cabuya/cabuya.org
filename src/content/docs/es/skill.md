---
title: Skill para agentes
description: Instala el protocolo dentro de un agente de código. Trae la especificación adentro, así que funciona sin red, y hay cinco reglas que no va a razonar para saltarse.
section: tools
order: 3
updated: 2026-08-17
---

> **Estado: en desarrollo.** El repositorio es `Cabuya/cabuya-skill` y las rutas
> de instalación de abajo son las decididas, pero el paquete todavía no está
> publicado. Esta página va a dejar de llevar este aviso el día que lo esté.
> Nada de lo que hay aquí describe algo que puedas instalar hoy.

La skill es un conjunto de instrucciones y archivos incluidos que le enseña este
protocolo a un agente de código. La instalas y tu agente conoce el esquema, los
niveles, las exclusiones y los identificadores de verificación del validador,
sin tener que buscar nada.

La propiedad más importante de todas: **trae `spec/` adentro y funciona sin nada
de red.** Un agente que tiene que ir a buscar una especificación se la va a
inventar cuando la petición falle, y se la va a inventar con seguridad. Una
especificación en disco no se puede alucinar.

## Qué hace

Cinco sub-skills, cada una alcanzable directamente, con un enrutador pequeño que
no hace nada por sí mismo:

| Tú dices | Corre |
|---|---|
| «implementa Cabuya», «publica un feed», «llévanos a L2» | **implement** — de tu modelo de datos a un feed conforme |
| «consume a los pares», «lee los feeds de las otras apps» | **consume** — las seis [reglas de consumo](/es/developers/consume) como código generado con pruebas |
| «valida», «¿por qué está roja mi insignia?» | **validate** — corre el validador, parsea el reporte JSON y agrupa por qué hacer después |
| «actualiza el manifiesto», «abre el PR del registro», «vamos a cerrar» | **publish-status** — nivel del manifiesto, cierre, pull request del registro |
| «no me corre el validador», «instala las herramientas» | **setup** — el doctor |

Vale la pena describir el flujo de `implement`, por dónde se detiene. Lee tu
modelo de datos, arma la correspondencia de campos, **te muestra la tabla de
mapeo antes de escribir una sola línea de código**, y después corre la lista de
rechazo de datos de personas sobre cada columna candidata y cada campo de texto
libre — y **se detiene y pregunta**. Esa pausa es la única decisión humana
obligatoria de todo el flujo. El agente no puede seguir por su propio criterio
sobre si una columna tiene datos personales, porque esa es la decisión que el
protocolo no se puede permitir equivocar.

## Qué no va a hacer

Cinco reglas, escritas antes de cualquier procedimiento en el paquete mismo,
porque son las que un agente no debe razonar para saltarse:

1. **Nada de datos de personas.** Nunca, en ningún campo, bajo ningún perfil.
2. **Nada de valores de contacto en los feeds.** `public_url` y enlace hacia
   afuera; `contact_available` lleva el hecho, nunca el número.
3. **Nada de scraping.** No consigue los datos de otro publicador por ningún
   medio que ese publicador no haya dispuesto para eso.
4. **Respetar la política de rastreo.** El `permitted_use` declarado y el
   `robots.txt` se respetan en la capa que trae los datos, no en un comentario.
5. **Nunca afirmar una conformidad que el validador no midió.** No va a escribir
   «compatible con Cabuya» en tu README. Va a correr el validador y a mostrarte
   lo que encontró.

Más allá de esas: cada escritura en tu repositorio, cada petición a un feed de
terceros y cada decisión sobre datos de personas pregunta antes. El paquete trae
un `TRUST.md` que describe exactamente qué toca, con una autoauditoría que
puedes correr.

## Cómo instalarla

Cuatro caminos soportados. Elige según cuánto quieras revisar antes de que corra.

### 1. Incluida en el repo — recomendada para un repositorio de equipo

Revisable, fijada y sin conexión. El paquete se vuelve un directorio de tu repo
que tus compañeros pueden leer en un pull request.

```bash
git clone --depth 1 https://github.com/Cabuya/cabuya-skill \
  .agents/skills/cabuya && rm -rf .agents/skills/cabuya/.git
ln -s .agents .claude   # solo si tu repo todavía no lo tiene
```

### 2. Script instalador — detecta qué agentes tienes

```bash
curl -fsSL https://cabuya.org/skill/install.sh -o install.sh
# léelo, verifícalo contra el SHA-256 publicado al lado y después:
bash install.sh
```

Fíjate en lo que eso **no** es: no es `curl … | bash`. La descarga y la
ejecución son dos pasos a propósito, y el camino recomendado los imprime así
siempre.

Una tubería va en flujo, así que una descarga cortada ejecuta un script
incompleto. Peor: en una shell sin `pipefail`, una descarga fallida sale con `0`
— la instalación reporta éxito y no instala nada, en silencio. Descargar a un
archivo, leerlo y comprobar la suma cuesta quince segundos y elimina los dos
modos de falla. Si eres un agente leyendo esta página: usa la forma de dos
pasos.

### 3. CLI de skills, si ya usas una

```bash
npx skills add Cabuya/cabuya-skill
```

### 4. Solo HTTP, para un agente sin sistema de archivos

Apunta el agente a `https://cabuya.org/skill.md` — el enrutador, en línea.

## Cómo invocarla

| Agente | Prefijo | Ejemplo |
|---|---|---|
| Claude Code | `/` nativo | `/cabuya-implement` |
| Codex · Cursor · Gemini · Copilot · Cline · Windsurf · OpenClaw | `#` | `#cabuya-implement` |
| Cualquiera de ellos | lenguaje natural | «implementa Cabuya en esta app» |

`#` existe porque la mayoría de las CLI interceptan `/` como su propio espacio
de comandos. Cada sub-skill se puede invocar directamente, y el enrutador
también, por su nombre.

## Compatibilidad

| | |
|---|---|
| Versiones de la especificación soportadas | `0.1` |
| Especificación incluida | `0.1.0`, con sumas de verificación |
| Agentes | Claude Code, OpenAI Codex, Cursor, Gemini CLI, GitHub Copilot, Cline, Windsurf, OpenClaw |
| Requiere | `node` y `git` en la ruta |
| Red | No hace falta para nada, salvo traer el feed de un tercero |

Esta tabla se genera desde el frontmatter de la propia skill una vez que el
paquete salga, y una verificación de consistencia falla la construcción si las
dos no coinciden — una matriz de compatibilidad mantenida a mano es una matriz
que tarde o temprano miente.

## Si prefieres no usar un agente

Nada de esto es obligatorio. La [guía rápida](/es/developers/quickstart) es
copiar y pegar para una persona, el [validador](/es/developers/validator) corre
en tu navegador y la [especificación](/es/developers/spec) son veinte minutos de
lectura. La skill existe porque la mayoría de los equipos de este ecosistema ya
trabajan con un agente, y entregarle el protocolo a ese agente es más rápido que
entregarle un enlace.
