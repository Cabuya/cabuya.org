/**
 * Validator output translations.
 *
 * Policy (`docs/context/PRODUCTS_BLUEPRINT.md` §6.5): output is **English by
 * default**, with `--lang es` translating `message`, `rule` and `fix`.
 * `id`, `pointer`, `spec` and `docs` are NEVER translated — check ids are
 * the stable handle that appears in issues, transcripts and the catalogue,
 * and a translated id would fragment every search for it.
 *
 * Spanish first, because the ecosystem this protocol serves works in
 * Spanish; the English default exists because the catalogue and the spec
 * are English artifacts and a mixed-language error string is worse than a
 * consistently foreign one.
 *
 * A test asserts every implemented check has a Spanish entry, so shipping a
 * new check without its translation fails CI rather than silently degrading
 * half the ecosystem's experience.
 */

import { CHECKS } from './checks.js';
import type { Finding } from './report.js';

export type OutputLanguage = 'en' | 'es';

interface CheckTranslation {
  /** Translated `rule` — the requirement clause. */
  rule: string;
  /** Translated `fix` — imperative. */
  fix: string;
}

/**
 * Per-check Spanish. Messages are generated with runtime detail (pointers,
 * matched classes, counts), so the translator receives the English message
 * and applies phrase-level substitutions; rule and fix are translated whole.
 */
export const ES: Record<string, CheckTranslation> = {
  SCH001: {
    rule: 'Todo feed y todo manifiesto DEBE validar contra su esquema versionado.',
    fix: 'Corrige el valor para que satisfaga el esquema.',
  },
  DSC002: {
    rule: 'Un manifiesto es JSON. Si en una ruta de descubrimiento responde HTML, es un catch-all: el manifiesto está ausente, no presente.',
    fix: 'Excluye esta ruta del catch-all de tu SPA para que se sirva el archivo.',
  },
  DSC005: {
    rule: 'El manifiesto DEBE conformar a su esquema.',
    fix: 'Corrige el manifiesto según el esquema publicado.',
  },
  ENV001: {
    rule: 'last_updated, ttl, version, publisher_id y license son OBLIGATORIOS en el envelope.',
    fix: 'Agrega el campo faltante al envelope.',
  },
  ENV002: {
    rule: 'La marca de generación DEBE ser inequívoca.',
    fix: 'Emite RFC 3339 con desfase explícito, por ejemplo "2026-08-16T04:00:00Z".',
  },
  ENV003: {
    rule: 'Un feed sin licencia no conforma: su ausencia bloquea la revisión legal de cualquier consumidor.',
    fix: 'Declara "license" en el envelope (por ejemplo "CC-BY-4.0").',
  },
  ENV004: {
    rule: 'DEBERÍA usarse una licencia resoluble por máquina.',
    fix: 'Usa un identificador SPDX, o agrega "license_url" apuntando al texto de la licencia.',
  },
  ENV005: {
    rule: 'El consentimiento de reuso viaja en el envelope: display | aggregate | redistribute | ai_answer | ai_train.',
    fix: 'Agrega "permitted_use" con los valores del enum cerrado.',
  },
  ENV006: {
    rule: 'Las versiones soportadas abarcan como máximo dos MAJOR.',
    fix: 'Publica una versión que este validador entienda, o actualiza el validador.',
  },
  ENV007: {
    rule: 'El MUST no obvio: sin esta cabecera todo consumidor de navegador necesita un proxy.',
    fix: 'Agrega la cabecera tal cual: `Access-Control-Allow-Origin: *`',
  },
  ENV008: {
    rule: 'ttl es el contrato de caché; valores implausibles rompen a quien hace polling.',
    fix: 'Usa un valor positivo en segundos, típicamente 60–3600 para datos vivos.',
  },
  ENV009: {
    rule: 'Pasada la guía de tamaño, los publicadores DEBERÍAN fragmentar por municipio y declarar los fragmentos en el manifiesto.',
    fix: 'Fragmenta por código DIVIPOLA y declara los fragmentos en feeds[] del manifiesto.',
  },
  ENV010: {
    rule: 'Higiene de transporte.',
    fix: 'Sirve el feed como `Content-Type: application/json; charset=utf-8`.',
  },
  REC001: {
    rule: 'La clave de confirmación es OBLIGATORIA; null es el honesto "nunca confirmado". Omitirla no lo es.',
    fix: 'Agrega "last_confirmed_at": null, o la marca de la última confirmación real. Nunca la inventes.',
  },
  REC002: {
    rule: 'La identidad de registro es {publisher_id}:{local_id} — única globalmente sin coordinación.',
    fix: 'Guarda solo tu id local; los consumidores componen el id calificado.',
  },
  REC003: {
    rule: 'Un publicador NO DEBE acuñar ids en el espacio de nombres de otro.',
    fix: 'Republica los registros ajenos con tu propio id y conserva el origen en source{}.',
  },
  REC004: {
    rule: 'Un lugar que nadie puede ubicar no dirige a nadie.',
    fix: 'Agrega address_text, o lat y lon (ambos son RECOMENDADOS).',
  },
  REC005: {
    rule: 'Dirección y coordenadas juntas sobreviven a más contextos de consumo que cualquiera por separado.',
    fix: 'Publica address_text Y lat+lon.',
  },
  REC006: {
    rule: 'El enlace de salida es el mecanismo de contacto — los valores de contacto nunca viajan.',
    fix: 'Agrega "public_url" con la URL absoluta de la ficha en tu sitio.',
  },
  REC007: {
    rule: 'El vocabulario compartido es lo que hace posibles las equivalencias; los tipos desconocidos usan other más una extensión con espacio de nombres.',
    fix: 'Usa uno de los valores del enum, o "other" con x_{publisher}_{campo}.',
  },
  REC008: {
    rule: 'La codificación territorial es DIVIPOLA; el publicador conserva su cadena cruda en municipality_text.',
    fix: 'Publica el código DIVIPOLA, o al menos municipality_text.',
  },
  REC009: {
    rule: 'La procedencia es estructurada, nunca prosa: la atribución y las cadenas dependen de ella.',
    fix: 'Agrega source{} con al menos source_id.',
  },
  REC010: {
    rule: 'Los nombres NO DEBEN codificar estado operativo — el estado va en lifecycle_status / service_status.',
    fix: 'Deja el nombre estable y humano; publica el estado en lifecycle_status y service_status.',
  },
  REC011: {
    rule: 'Un registro que dice dos cosas sobre su propio estado no se puede mostrar con honestidad.',
    fix: 'Haz que el registro diga una sola cosa: corrige el estado, o quita el estado del nombre.',
  },
  REC012: {
    rule: 'Una edición no es una confirmación; las dos marcas de tiempo no se intercambian.',
    fix: 'Fija last_confirmed_at solo cuando alguien confirmó el lugar; si no, déjalo en null.',
  },
  REC013: {
    rule: 'Los lugares temporales DEBERÍAN declarar cuándo dejan de ser ciertos.',
    fix: 'Fija expires_at para que los consumidores dejen de mostrarlo cuando caduque.',
  },
  REC014: {
    rule: 'same_as es una afirmación de un solo salto y no transitiva.',
    fix: 'Usa la forma calificada {publisher_id}:{id} y no te referencies a ti mismo.',
  },
  REC015: {
    rule: 'La extensibilidad aplica primero al validador: un miembro desconocido NO DEBE fallar la validación.',
    fix: 'No requiere acción del publicador.',
  },
  REC016: {
    rule: 'Las extensiones con espacio de nombres evitan que dos publicadores choquen en un campo privado.',
    fix: 'Renómbrala a x_{publisher}_{campo}.',
  },
  REC017: {
    rule: 'es es la línea base OBLIGATORIA para cadenas legibles por humanos; en es RECOMENDADO.',
    fix: 'Agrega una entrada {text, language: "es"}.',
  },
  REC018: {
    rule: 'Dos registros con un mismo id vuelven incorrecta toda deduplicación aguas abajo.',
    fix: 'Dale a cada registro un id local distinto.',
  },
  PII001: {
    rule: 'Los valores de contacto NO DEBEN viajar en los feeds — las extensiones con espacio de nombres no los eximen.',
    fix: 'Elimina el valor. Publica contact_available: true y deja que public_url lleve al lector a tu propia página.',
  },
  PII002: {
    rule: 'confirmed_by ∈ team | volunteer | official_source | partner:{publisher_id}.',
    fix: 'Reemplázalo por el rol que confirmó el lugar: team, volunteer, official_source o partner:{publisher_id}.',
  },
  PII003: {
    rule: 'El texto libre es el tercer canal de fuga: los publicadores DEBEN limpiar datos personales de description y warning_text.',
    fix: 'Quita el nombre y los datos de contacto del texto libre; enlaza con public_url.',
  },
  PII004: {
    rule: 'Los datos de personas no federan — es una prohibición de cruce, no una omisión de campos.',
    fix: 'Elimínalo. El dominio de personas es solo enlace de salida a los canales oficiales.',
  },
  PII005: {
    rule: 'Un campo nombrado para datos de contacto terminará por llevarlos.',
    fix: 'Renombra o elimina el campo.',
  },
  PII006: {
    rule: 'Los veredictos de moderación no federan; los registros suprimidos se omiten, no se etiquetan aguas abajo.',
    fix: 'Omite el registro en lugar de etiquetarlo.',
  },
  BEH001: {
    rule: 'Un feed que responde distinto en dos sondeos no se puede consumir de forma confiable.',
    fix: 'Sirve el feed de forma determinista.',
  },
  BEH002: {
    rule: 'last_updated DEBE generarse al construir/publicar, nunca por petición — una marca por petición es peor que no tener señal.',
    fix: 'Sella last_updated cuando generas el feed y guárdalo; así los consumidores pueden detectar cambios reales.',
  },
  BEH003: {
    rule: 'La obsolescencia es información, no fracaso — pero debe ser visible.',
    fix: 'Regenera el feed, o sube ttl para describir tu cadencia real de actualización.',
  },
  LIC001: {
    rule: 'Las licencias share-alike envenenan la agregación para los consumidores aguas abajo.',
    fix: 'Prefiere una licencia permisiva (CC-BY-4.0, CC0-1.0) si no buscas esa restricción.',
  },
  LIC002: {
    rule: 'La atribución es un MUST de consumo; una cadena explícita facilita cumplirlo.',
    fix: 'Agrega "attribution" con el crédito que quieres que se muestre.',
  },
};

/** Message fragments that recur across generated messages. */
const PHRASES: [RegExp, string][] = [
  [
    /required property '([^']+)' is missing/g,
    "falta la propiedad obligatoria '$1'",
  ],
  [
    /\(did you mean to publish last_confirmed_at: null\?\)/g,
    '(¿querías publicar last_confirmed_at: null?)',
  ],
  [
    /value is outside the allowed set/g,
    'el valor está fuera del conjunto permitido',
  ],
  [/wrong type \(expected ([^)]+)\)/g, 'tipo incorrecto (se esperaba $1)'],
  [
    /value does not match the required shape/g,
    'el valor no coincide con la forma requerida',
  ],
  [/not a valid ([a-z-]+)/g, 'no es un $1 válido'],
  [/value not echoed/g, 'valor no reproducido'],
  [
    /contact values MUST NOT travel in feeds \(use contact_available \+ public_url\)/g,
    'los valores de contacto NO DEBEN viajar en los feeds (usa contact_available + public_url)',
  ],
  [
    /must be a role token \(([^)]+)\), never a personal name/g,
    'debe ser un token de rol ($1), nunca el nombre de una persona',
  ],
  [
    /possible personal data detected \(name\+phone pattern\) — strip before publishing/g,
    'posible dato personal detectado (patrón nombre+teléfono) — límpialo antes de publicar',
  ],
  [
    /operational state token detected in name \('([^']+)'\) — move it to service_status\/lifecycle_status \(CR-2\)/g,
    "token de estado operativo detectado en el nombre ('$1') — muévelo a service_status/lifecycle_status (CR-2)",
  ],
  [
    /value advanced with the probe clock on identical content — generate at build\/publish time, not per request/g,
    'el valor avanzó con el reloj del sondeo sin cambiar el contenido — genéralo al construir/publicar, no por petición',
  ],
];

/** Translate a finding's human-facing fields. Ids and links never change. */
export function translateFinding(
  finding: Finding,
  language: OutputLanguage
): Finding {
  if (language === 'en') return finding;
  const entry = ES[finding.id];
  let message = finding.message;
  for (const [pattern, replacement] of PHRASES) {
    message = message.replace(pattern, replacement);
  }
  return {
    ...finding,
    message,
    rule: entry?.rule ?? finding.rule,
    fix: entry?.fix ?? finding.fix,
  };
}

/** Check ids missing a Spanish entry — used by the completeness test. */
export function untranslatedChecks(): string[] {
  return CHECKS.filter((c) => c.implemented && !ES[c.id]).map((c) => c.id);
}
