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
  /**
   * Translated `title` — the one-line name of the check.
   *
   * Added after the catalogue page was found rendering Spanish rules and
   * fixes under an English heading, which reads as a half-translated page
   * rather than as a deliberate exception.
   */
  title: string;
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
    title: 'El documento no cumple con su esquema JSON publicado',
    rule: 'Todo feed y todo manifiesto DEBE validar contra su esquema versionado.',
    fix: 'Corrige el valor para que satisfaga el esquema.',
  },
  DSC002: {
    title:
      'Soft-404: no hay una ruta de descubrimiento que responda 200 + text/html',
    rule: 'Un manifiesto es JSON. Si en una ruta de descubrimiento responde HTML, es un catch-all: el manifiesto está ausente, no presente.',
    fix: 'Excluye esta ruta del catch-all de tu SPA para que se sirva el archivo.',
  },
  DSC005: {
    title: 'El manifiesto valida contra manifest.schema.json',
    rule: 'El manifiesto DEBE conformar a su esquema.',
    fix: 'Corrige el manifiesto según el esquema publicado.',
  },
  ENV001: {
    title: 'Los campos obligatorios del sobre están presentes y bien tipados',
    rule: 'last_updated, ttl, version, publisher_id y license son OBLIGATORIOS en el envelope.',
    fix: 'Agrega el campo faltante al envelope.',
  },
  ENV002: {
    title: 'last_updated es RFC 3339 con desfase UTC',
    rule: 'La marca de generación DEBE ser inequívoca.',
    fix: 'Emite RFC 3339 con desfase explícito, por ejemplo "2026-08-16T04:00:00Z".',
  },
  ENV003: {
    title: 'license presente',
    rule: 'Un feed sin licencia no conforma: su ausencia bloquea la revisión legal de cualquier consumidor.',
    fix: 'Declara "license" en el envelope (por ejemplo "CC-BY-4.0").',
  },
  ENV004: {
    title: 'license es un identificador SPDX, o va acompañado de license_url',
    rule: 'DEBERÍA usarse una licencia resoluble por máquina.',
    fix: 'Usa un identificador SPDX, o agrega "license_url" apuntando al texto de la licencia.',
  },
  ENV005: {
    title: 'permitted_use presente, con valores dentro del enum cerrado',
    rule: 'El consentimiento de reuso viaja en el envelope: display | aggregate | redistribute | ai_answer | ai_train.',
    fix: 'Agrega "permitted_use" con los valores del enum cerrado.',
  },
  ENV006: {
    title: 'version es una versión de la especificación soportada',
    rule: 'Las versiones soportadas abarcan como máximo dos MAJOR.',
    fix: 'Publica una versión que este validador entienda, o actualiza el validador.',
  },
  ENV007: {
    title: 'Access-Control-Allow-Origin: * presente',
    rule: 'El MUST no obvio: sin esta cabecera todo consumidor de navegador necesita un proxy.',
    fix: 'Agrega la cabecera tal cual: `Access-Control-Allow-Origin: *`',
  },
  ENV008: {
    title: 'ttl es un entero positivo y plausible (1–86400)',
    rule: 'ttl es el contrato de caché; valores implausibles rompen a quien hace polling.',
    fix: 'Usa un valor positivo en segundos, típicamente 60–3600 para datos vivos.',
  },
  ENV009: {
    title:
      'Feed de 5 MB o menos y 10 000 registros o menos, o con fragmentos declarados',
    rule: 'Pasada la guía de tamaño, los publicadores DEBERÍAN fragmentar por municipio y declarar los fragmentos en el manifiesto.',
    fix: 'Fragmenta por código DIVIPOLA y declara los fragmentos en feeds[] del manifiesto.',
  },
  ENV010: {
    title: 'Content-Type: application/json, UTF-8',
    rule: 'Higiene de transporte.',
    fix: 'Sirve el feed como `Content-Type: application/json; charset=utf-8`.',
  },
  REC001: {
    title:
      'La CLAVE last_confirmed_at está en todos los registros (null es válido)',
    rule: 'La clave de confirmación es OBLIGATORIA; null es el honesto "nunca confirmado". Omitirla no lo es.',
    fix: 'Agrega "last_confirmed_at": null, o la marca de la última confirmación real. Nunca la inventes.',
  },
  REC002: {
    title: 'id sigue la forma {publisher_id}:{local_id}',
    rule: 'La identidad de registro es {publisher_id}:{local_id} — única globalmente sin coordinación.',
    fix: 'Guarda solo tu id local; los consumidores componen el id calificado.',
  },
  REC003: {
    title: 'No se acuñan identificadores en el espacio de otro publicador',
    rule: 'Un publicador NO DEBE acuñar ids en el espacio de nombres de otro.',
    fix: 'Republica los registros ajenos con tu propio id y conserva el origen en source{}.',
  },
  REC004: {
    title: 'Regla de ubicación: address_text O lat+lon presentes',
    rule: 'Un lugar que nadie puede ubicar no dirige a nadie.',
    fix: 'Agrega address_text, o lat y lon (ambos son RECOMENDADOS).',
  },
  REC005: {
    title: 'Ambas ubicaciones presentes (RECOMENDADO)',
    rule: 'Dirección y coordenadas juntas sobreviven a más contextos de consumo que cualquiera por separado.',
    fix: 'Publica address_text Y lat+lon.',
  },
  REC006: {
    title: 'public_url presente y absoluta',
    rule: 'El enlace de salida es el mecanismo de contacto — los valores de contacto nunca viajan.',
    fix: 'Agrega "public_url" con la URL absoluta de la ficha en tu sitio.',
  },
  REC007: {
    title: 'place_kind dentro del enum',
    rule: 'El vocabulario compartido es lo que hace posibles las equivalencias; los tipos desconocidos usan other más una extensión con espacio de nombres.',
    fix: 'Usa uno de los valores del enum, o "other" con x_{publisher}_{campo}.',
  },
  REC008: {
    title: 'municipality_code es un código DIVIPOLA válido',
    rule: 'La codificación territorial es DIVIPOLA; el publicador conserva su cadena cruda en municipality_text.',
    fix: 'Publica el código DIVIPOLA, o al menos municipality_text.',
  },
  REC009: {
    title: 'source{} presente, con source_id',
    rule: 'La procedencia es estructurada, nunca prosa: la atribución y las cadenas dependen de ella.',
    fix: 'Agrega source{} con al menos source_id.',
  },
  REC010: {
    title: 'CR-2: name no contiene ningún token de estado operativo',
    rule: 'Los nombres NO DEBEN codificar estado operativo — el estado va en lifecycle_status / service_status.',
    fix: 'Deja el nombre estable y humano; publica el estado en lifecycle_status y service_status.',
  },
  REC011: {
    title: 'Los campos name y status no se contradicen entre sí',
    rule: 'Un registro que dice dos cosas sobre su propio estado no se puede mostrar con honestidad.',
    fix: 'Haz que el registro diga una sola cosa: corrige el estado, o quita el estado del nombre.',
  },
  REC012: {
    title: 'CR-1: updated_at no es un last_confirmed_at reutilizado',
    rule: 'Una edición no es una confirmación; las dos marcas de tiempo no se intercambian.',
    fix: 'Fija last_confirmed_at solo cuando alguien confirmó el lugar; si no, déjalo en null.',
  },
  REC013: {
    title:
      'expires_at definido en los tipos de lugar temporales por naturaleza',
    rule: 'Los lugares temporales DEBERÍAN declarar cuándo dejan de ser ciertos.',
    fix: 'Fija expires_at para que los consumidores dejen de mostrarlo cuando caduque.',
  },
  REC014: {
    title: 'Las entradas de same_as son absolutas y de un solo salto',
    rule: 'same_as es una afirmación de un solo salto y no transitiva.',
    fix: 'Usa la forma calificada {publisher_id}:{id} y no te referencies a ti mismo.',
  },
  REC015: {
    title: 'Los miembros desconocidos se conservan, nunca se rechazan',
    rule: 'La extensibilidad aplica primero al validador: un miembro desconocido NO DEBE fallar la validación.',
    fix: 'No requiere acción del publicador.',
  },
  REC016: {
    title: 'Las extensiones x_ llevan el espacio x_{publisher}_{field}',
    rule: 'Las extensiones con espacio de nombres evitan que dos publicadores choquen en un campo privado.',
    fix: 'Renómbrala a x_{publisher}_{campo}.',
  },
  REC017: {
    title: 'Hay una base en es para las cadenas localizadas',
    rule: 'es es la línea base OBLIGATORIA para cadenas legibles por humanos; en es RECOMENDADO.',
    fix: 'Agrega una entrada {text, language: "es"}.',
  },
  REC018: {
    title: 'No hay id duplicado dentro de un mismo feed',
    rule: 'Dos registros con un mismo id vuelven incorrecta toda deduplicación aguas abajo.',
    fix: 'Dale a cada registro un id local distinto.',
  },
  PII001: {
    title: 'Aparece un valor de contacto en algún campo, extensiones incluidas',
    rule: 'Los valores de contacto NO DEBEN viajar en los feeds — las extensiones con espacio de nombres no los eximen.',
    fix: 'Elimina el valor. Publica contact_available: true y deja que public_url lleve al lector a tu propia página.',
  },
  PII002: {
    title: 'confirmed_by es un token de rol, nunca el nombre de una persona',
    rule: 'confirmed_by ∈ team | volunteer | official_source | partner:{publisher_id}.',
    fix: 'Reemplázalo por el rol que confirmó el lugar: team, volunteer, official_source o partner:{publisher_id}.',
  },
  PII003: {
    title: 'El texto libre coincide con un patrón de datos personales',
    rule: 'El texto libre es el tercer canal de fuga: los publicadores DEBEN limpiar datos personales de description y warning_text.',
    fix: 'Quita el nombre y los datos de contacto del texto libre; enlaza con public_url.',
  },
  PII004: {
    title: 'Aparece una entidad a nivel de persona',
    rule: 'Los datos de personas no federan — es una prohibición de cruce, no una omisión de campos.',
    fix: 'Elimínalo. El dominio de personas es solo enlace de salida a los canales oficiales.',
  },
  PII005: {
    title:
      'Un nombre de campo coincide con la lista de rechazo aunque el valor parezca limpio',
    rule: 'Un campo nombrado para datos de contacto terminará por llevarlos.',
    fix: 'Renombra o elimina el campo.',
  },
  PII006: {
    title: 'Se republica una decisión de moderación sobre un tercero',
    rule: 'Los veredictos de moderación no federan; los registros suprimidos se omiten, no se etiquetan aguas abajo.',
    fix: 'Omite el registro en lugar de etiquetarlo.',
  },
  BEH001: {
    title:
      'El feed responde en dos sondeos; el content-type se mantiene estable',
    rule: 'Un feed que responde distinto en dos sondeos no se puede consumir de forma confiable.',
    fix: 'Sirve el feed de forma determinista.',
  },
  BEH002: {
    title:
      'Siempre-ahora: last_updated avanza con el reloj del sondeo sobre contenido idéntico',
    rule: 'last_updated DEBE generarse al construir/publicar, nunca por petición — una marca por petición es peor que no tener señal.',
    fix: 'Sella last_updated cuando generas el feed y guárdalo; así los consumidores pueden detectar cambios reales.',
  },
  BEH003: {
    title:
      'last_updated más viejo que 7 × ttl (el estado de insignia obsoleta)',
    rule: 'La obsolescencia es información, no fracaso — pero debe ser visible.',
    fix: 'Regenera el feed, o sube ttl para describir tu cadencia real de actualización.',
  },
  LIC001: {
    title: 'La licencia declarada no es share-alike',
    rule: 'Las licencias share-alike envenenan la agregación para los consumidores aguas abajo.',
    fix: 'Prefiere una licencia permisiva (CC-BY-4.0, CC0-1.0) si no buscas esa restricción.',
  },
  LIC002: {
    title: 'Cadena attribution presente, para que los agregadores la muestren',
    rule: 'La atribución es un MUST de consumo; una cadena explícita facilita cumplirlo.',
    fix: 'Agrega "attribution" con el crédito que quieres que se muestre.',
  },
  DSC001: {
    title: 'Manifiesto alcanzable por HTTPS como JSON',
    rule: 'El manifiesto MUST servirse por HTTPS con Content-Type: application/json.',
    fix: 'Sirve el manifiesto por HTTPS con un tipo de contenido JSON, y compruébalo desde fuera de tu red.',
  },
  DSC003: {
    title: 'robots.txt devuelve 200 text/plain',
    rule: 'Las precondiciones de L2 y superiores incluyen un robots.txt real.',
    fix: 'Sirve un robots.txt real en la raíz, con tipo de contenido text/plain.',
  },
  DSC004: {
    title: 'Manifiesto en la ruta RECOMMENDED, o anunciado con <link rel>',
    rule: 'El manifiesto SHOULD vivir en /.well-known/cabuya.json, o anunciarse con <link rel="cabuya">.',
    fix: 'Mueve el manifiesto a /.well-known/cabuya.json, o anuncia su ubicación con un <link rel="cabuya">.',
  },
  DSC006: {
    title: 'publisher.canonical_url coincide con la entrada del registro',
    rule: 'El manifiesto de un publicador registrado MUST coincidir con su entrada del registro en la URL canónica.',
    fix: 'Haz que la URL canónica del manifiesto coincida con la de tu entrada en el registro, o abre un pull request para cambiar la entrada.',
  },
  DSC007: {
    title: 'Toda feeds[].url es HTTPS absoluta y alcanzable',
    rule: 'Los feeds declarados MUST resolver.',
    fix: 'Dale a cada feed una URL https absoluta que resuelva desde fuera de tu red.',
  },
  DSC008: {
    title: 'crawl_policy_url resuelve',
    rule: 'La política declarada de rastreo y reutilización SHOULD poder descargarse — los consumidores tienen que respetarla.',
    fix: 'Apunta crawl_policy_url a una página que exista, o quita el campo.',
  },
  DSC009: {
    title: 'conformance_target no excede el nivel medido',
    rule: 'conformance_target es una declaración; MUST NOT afirmar más de lo que esta ejecución mide. Se reporta como discrepancia, nunca como el nivel.',
    fix: 'Baja conformance_target al nivel que realmente alcanzas, o corrige lo que bloquea el nivel que declaras. El objetivo es una intención, no una afirmación.',
  },
  BEH004: {
    title:
      'lastmod por fragmento presente (el patrón de sincronización incremental)',
    rule: 'Un lastmod por fragmento es sincronización incremental funcionando a costo cero.',
    fix: 'Publica un lastmod por fragmento para que los consumidores descarguen solo lo que cambió.',
  },
  BEH005: {
    title:
      'Los fragmentos declarados son alcanzables y consistentes con el sobre',
    rule: 'Un fragmento declarado que no concuerda con sus hermanos rompe a todo consumidor que confíe en el manifiesto.',
    fix: 'Haz que todos los fragmentos declarados sean alcanzables y consistentes con el sobre que los declara.',
  },
  API001: {
    title:
      'La base de la API de lectura es alcanzable; la forma del sobre es idéntica a la del feed',
    rule: 'Un esquema, cuatro transportes.',
    fix: 'Sirve la API de lectura en la base declarada, con la misma forma de sobre que el feed estático.',
  },
  API002: {
    title:
      'Estático ≡ API: el mismo registro es compatible byte a byte desde ambas superficies',
    rule: 'La regla de equivalencia es lo que permite que un esquema sirva cuatro transportes.',
    fix: 'Devuelve registros compatibles byte a byte desde la API y desde el feed. Un consumidor no debe tener que saber cuál de los dos leyó.',
  },
  API003: {
    title:
      'Paginación por cursor ordenada sobre una secuencia del servidor, no sobre una marca de tiempo',
    rule: 'Los cursores por marca de tiempo descartan en silencio los registros compuestos sin conexión que llegan tarde.',
    fix: 'Pagina sobre una secuencia del lado del servidor en vez de una marca de tiempo. Las marcas de tiempo colisionan y se saltan registros.',
  },
  API004: {
    title: 'Se aceptan los parámetros de consulta documentados',
    rule: 'municipality, kind, bbox, updated_since, limit, cursor.',
    fix: 'Acepta los parámetros de consulta documentados, o quítalos de la documentación.',
  },
  API005: {
    title: 'CORS * en la API; sin autenticación para lecturas',
    rule: 'Las lecturas son públicas por diseño.',
    fix: 'Sirve la API con CORS * y sin autenticación para lecturas. Datos de interés público detrás de una llave no son públicos.',
  },
  API006: {
    title: 'Consume al menos un feed de un par (en parte autodeclarado)',
    rule: 'L3 exige consumir además de servir — el único requisito que un sondeo no puede medir del todo, así que se reporta como info con la limitación declarada.',
    fix: 'Consume al menos un feed de un par. El nivel trata de interoperar, no solo de publicar.',
  },
  WRT001: {
    title: 'POST acepta el sobre {source, external_id, place}',
    rule: 'El sobre de escritura es fijo.',
    fix: 'Acepta el sobre {source, external_id, place} en el POST.',
  },
  WRT002: {
    title: 'Idempotencia en (source, external_id): un reenvío no duplica',
    rule: 'Reenviar es un upsert de la contribución del propio emisor, nunca un duplicado.',
    fix: 'Haz las escrituras idempotentes en (source, external_id). Un reenvío tras un tiempo agotado no debe crear un segundo registro.',
  },
  WRT003: {
    title: '409 ante un conflicto de id fuera del espacio del emisor',
    rule: 'La disciplina de espacios de nombres se aplica en la frontera de escritura.',
    fix: 'Devuelve 409 cuando un emisor intente escribir un id fuera de su propio espacio de nombres.',
  },
  WRT004: {
    title:
      'En modo auth:none se devuelve el estado de moderación y el límite de tasa es observable',
    rule: 'Las escrituras abiertas REQUIRE mitigaciones: límite de tasa, cola de moderación y un estado devuelto en eco.',
    fix: 'Devuelve en eco el estado de moderación y haz observable el límite de tasa, para que un emisor sin autenticar sepa qué pasó con su escritura.',
  },
  WRT005: {
    title:
      'Los registros republicados llevan source.source_id = el emisor original',
    rule: 'La identidad del emisor viaja con el registro para siempre.',
    fix: 'Conserva source.source_id como el emisor original al republicar. La atribución es lo que tiene que sobrevivir al salto.',
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
