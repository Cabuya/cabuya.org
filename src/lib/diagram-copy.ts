/**
 * The one-line caption and the full spoken description for each diagram.
 *
 * Both strings were declared inside the diagram components, where the Markdown
 * twins could not reach them: an agent reading `/index.md` got no trace of the
 * eight diagrams the page renders — not the picture, which is fair, and not the
 * sentence underneath it, which is not. `scripts/audit-md-blocks.mjs` found the
 * gap by asking whether every prose block on a page survives into its twin.
 *
 * `ariaLabel` is the better of the two for a twin: it is already written as the
 * diagram described in words, because that is what a screen reader announces.
 * A reader who cannot see the picture and an agent that cannot render it want
 * the same thing.
 *
 * The components import from here, so the page, the screen reader and the twin
 * cannot drift apart.
 */

import type { Language } from './i18n';

export interface DiagramCopy {
  /** The diagram described in words — what a screen reader announces. */
  ariaLabel: string;
  /** The one line printed under the figure. */
  caption: string;
}

export const DIAGRAM_COPY: Record<string, Record<Language, DiagramCopy>> = {
  quickstartPath: {
    en: {
      ariaLabel:
        'Five steps: write the manifest, export one feed, run the validator, fix what it reports, then open a registry pull request. The first three are typically under an hour; the whole path is an afternoon for a small application.',
      caption:
        'An afternoon, step by step. Each one produces a file or a result you can look at.',
    },
    es: {
      ariaLabel:
        'Cinco pasos: escribir el manifiesto, exportar un feed, correr el validador, arreglar lo que reporte y abrir un pull request al registro. Los primeros tres suelen tomar menos de una hora; el camino completo es una tarde para una aplicación pequeña.',
      caption:
        'Una tarde, paso a paso. Cada uno produce un archivo o un resultado que puedes mirar.',
    },
  },
  validatorLoop: {
    en: {
      ariaLabel:
        'A loop with four stations: run the validator, read a finding, apply the fix, run again. Exit code 1 means the data is wrong and sends the agent back around; exit code 3 means the network failed and stops the loop instead. A clean run exits to the registry pull request.',
      caption:
        'The loop terminates because every finding locates the problem and states the fix — and because a transport failure exits instead of looping.',
    },
    es: {
      ariaLabel:
        'Un bucle con cuatro estaciones: correr el validador, leer un hallazgo, aplicar el arreglo, correr otra vez. El código de salida 1 significa que el dato está mal y devuelve al agente al bucle; el código 3 significa que la red falló y detiene el bucle. Una corrida limpia sale hacia el pull request del registro.',
      caption:
        'El bucle termina porque cada hallazgo ubica el problema y dice cómo arreglarlo — y porque un fallo de transporte sale en vez de reintentar en círculo.',
    },
  },
  conformanceLadder: {
    en: {
      ariaLabel:
        'A five-rung ladder. L0 Listed takes minutes, L1 Linked under an hour, L2 Publishes one afternoon, L3 Serves and consumes days, L4 Federates varies by app. Two further classes — directory-only and link-out-only — stop at L1 by choice or by rule, and are respected members.',
      caption:
        'A ladder, not a gate: every rung is a membership class, and stopping at one is a position, not a failure.',
    },
    es: {
      ariaLabel:
        'Una escalera de cinco peldaños. L0 Listada toma minutos, L1 Enlazada menos de una hora, L2 Publica una tarde, L3 Sirve y consume días, L4 Federa según la app. Otras dos clases —solo directorio y solo enlace— se detienen en L1 por decisión o por regla, y son miembros respetados.',
      caption:
        'Una escalera, no una puerta: cada peldaño es una clase de membresía, y quedarse en uno es una posición, no un fracaso.',
    },
  },
  exclusionBoundary: {
    en: {
      ariaLabel:
        'A wall between two sides. Places, capacities, needs and org-level contacts cross it. Personal names, personal phone numbers, individual cases and moderation verdicts never do. A door in the wall marks the link-out: person-level help stays inside the app that owns it.',
      caption:
        'A join prohibition, not a field omission: the network must not be able to reconstruct a person’s situation, whatever fields it carries.',
    },
    es: {
      ariaLabel:
        'Un muro entre dos lados. Los lugares, capacidades, necesidades y contactos institucionales lo cruzan. Los nombres personales, teléfonos personales, casos individuales y decisiones de moderación nunca lo hacen. Una puerta en el muro marca el enlace: la ayuda a nivel de persona se queda dentro de la app que la administra.',
      caption:
        'Una prohibición de cruce, no una omisión de campos: la red no debe poder reconstruir la situación de una persona, con los campos que sea.',
    },
  },
  feedAnatomy: {
    en: {
      ariaLabel:
        'A feed envelope with five required fields — last_updated, ttl, version, publisher_id and license — wrapping an array of place records. Each field answers a question a consumer must be able to answer: how old, how long may I cache, which schema, who published, what may I do with it.',
      caption:
        'Five envelope fields and an array. Each field exists because a consumer has to answer a question without asking you.',
    },
    es: {
      ariaLabel:
        'Un sobre de feed con cinco campos obligatorios —last_updated, ttl, version, publisher_id y license— que envuelve un arreglo de registros place. Cada campo responde una pregunta que un consumidor debe poder responder: qué tan viejo es, cuánto puedo cachearlo, qué esquema, quién lo publicó, qué puedo hacer con él.',
      caption:
        'Cinco campos de sobre y un arreglo. Cada campo existe porque un consumidor tiene que responder una pregunta sin preguntarte a ti.',
    },
  },
  networkFlow: {
    en: {
      ariaLabel:
        'Three applications, each publishing a feed and reading the others. Records carry their publisher_id with them, so attribution survives every hop. The registry sits to one side, recording who exists and what was measured; no data passes through it.',
      caption:
        'No hub. Every app is a source and a reader at once, and attribution travels with the record.',
    },
    es: {
      ariaLabel:
        'Tres aplicaciones, cada una publicando un feed y leyendo las de las otras. Los registros llevan su publisher_id consigo, así que la atribución sobrevive cada salto. El registro está a un lado, anotando quién existe y qué se midió; ningún dato pasa por él.',
      caption:
        'Sin centro. Cada app es fuente y lectora a la vez, y la atribución viaja con el registro.',
    },
  },
  oneSchemaFourTransports: {
    en: {
      ariaLabel:
        'One place record at the centre, feeding four equivalent transports: the static feed, which the validator measures today, and the read API, write API and MCP server, which are specified but not measured in version 0.1. All four carry the same schema.',
      caption:
        'One schema, four transports. Which one you serve is an operations decision — the record does not change.',
    },
    es: {
      ariaLabel:
        'Un registro place en el centro que alimenta cuatro transportes equivalentes: el feed estático, que el validador mide hoy, y la API de lectura, la API de escritura y el servidor MCP, que están especificados pero no se miden en la versión 0.1. Los cuatro llevan el mismo esquema.',
      caption:
        'Un esquema, cuatro transportes. Cuál sirves es una decisión de operación — el registro no cambia.',
    },
  },
  verificationBlock: {
    en: {
      ariaLabel:
        'Two timestamps compared. updated_at records when the row was last edited; last_confirmed_at records when a human last verified the place is really open. They answer different questions, and last_confirmed_at may be null, which means nobody has checked — a valid and useful answer.',
      caption:
        'Editing a record is not confirming it. When nobody has checked, publish null — it is a real answer, and consumers know what to do with it.',
    },
    es: {
      ariaLabel:
        'Dos marcas de tiempo comparadas. updated_at registra cuándo se editó la fila por última vez; last_confirmed_at registra cuándo una persona verificó por última vez que el lugar está realmente abierto. Responden preguntas distintas, y last_confirmed_at puede ser null, lo que significa que nadie ha verificado: una respuesta válida y útil.',
      caption:
        'Editar un registro no es confirmarlo. Cuando nadie ha verificado, publica null — es una respuesta real, y los consumidores saben qué hacer con ella.',
    },
  },
};
