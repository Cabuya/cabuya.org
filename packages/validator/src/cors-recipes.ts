/**
 * How to serve `Access-Control-Allow-Origin: *` on a static host.
 *
 * The specification calls this "the one non-obvious MUST" (§3, the feed
 * envelope), and it is the check a publisher who did everything else right
 * fails first. Two static files at stable URLs are schema-valid and are *not*
 * L2: ENV007 needs a response header, which no amount of editing JSON produces.
 *
 * Walking the quickstart end to end confirmed it. Copying both files verbatim,
 * publishing them and pointing the validator at the manifest returns
 * `non-conformant: 1 error — ENV007`, on the first real run, to a reader the
 * page has just told the whole job is two files.
 *
 * The requirement is not arbitrary. Without the header, every browser-based
 * consumer needs a server-side proxy to read the feed — which means the class
 * of consumer with the lowest cost to build is the one class that cannot,
 * and the network's cheapest participants are the ones excluded.
 *
 * Lives here rather than on the website for the reason `SPA_EXCLUSIONS` does:
 * the CLI's `init`, the quickstart page and the agent skill's stack guides all
 * need the same words, and three copies are three things that drift. Spanish
 * ships alongside because the quickstart is bilingual.
 *
 * Snippets are literal file contents, ready to paste. They carry no Markdown:
 * an HTML page, a terminal and an agent's context all render them, and none of
 * the three interprets emphasis.
 */

export interface CorsRecipe {
  /** Stable id — also the `--host` value for `init`. */
  id: string;
  /** Display name, as the host writes it. */
  label: string;
  /** The file to create, when the fix is a file. */
  file?: string;
  /** Its exact contents, or the configuration line to add. */
  snippet: string;
  note: { en: string; es: string };
}

export const CORS_RECIPES: readonly CorsRecipe[] = [
  {
    id: 'cloudflare-pages',
    label: 'Cloudflare Pages',
    file: '_headers',
    snippet: '/*\n  Access-Control-Allow-Origin: *',
    note: {
      en: 'A `_headers` file at the root of the published output. Cloudflare applies it at the edge, so nothing in your build has to know about it.',
      es: 'Un archivo `_headers` en la raíz de la salida publicada. Cloudflare lo aplica en el borde, así que nada en tu compilación necesita saber de él.',
    },
  },
  {
    id: 'netlify',
    label: 'Netlify',
    file: '_headers',
    snippet: '/*\n  Access-Control-Allow-Origin: *',
    note: {
      en: 'The same `_headers` format, in the publish directory. Netlify ignores the file if it is outside it, which is the usual reason a correct file has no effect.',
      es: 'El mismo formato `_headers`, en el directorio de publicación. Netlify ignora el archivo si queda fuera, que es la razón habitual de que un archivo correcto no surta efecto.',
    },
  },
  {
    id: 'vercel',
    label: 'Vercel',
    file: 'vercel.json',
    snippet:
      '{\n  "headers": [\n    {\n      "source": "/(.*)",\n      "headers": [\n        { "key": "Access-Control-Allow-Origin", "value": "*" }\n      ]\n    }\n  ]\n}',
    note: {
      en: 'Merge the `headers` array into an existing `vercel.json` rather than replacing the file.',
      es: 'Combina el arreglo `headers` con un `vercel.json` existente en vez de reemplazar el archivo.',
    },
  },
  {
    id: 'nginx',
    label: 'nginx',
    snippet:
      'location /.well-known/cabuya.json {\n  add_header Access-Control-Allow-Origin *;\n}\n\nlocation /feeds/ {\n  add_header Access-Control-Allow-Origin *;\n}',
    note: {
      en: 'Scope it to the manifest and the feeds rather than to the whole server. `add_header` inside a `location` block replaces any inherited headers, so declare it where it applies.',
      es: 'Acótalo al manifiesto y a los feeds, no al servidor entero. `add_header` dentro de un bloque `location` reemplaza las cabeceras heredadas, así que decláralo donde aplica.',
    },
  },
  {
    id: 'apache',
    label: 'Apache',
    file: '.htaccess',
    snippet:
      '<FilesMatch "cabuya\\.json$|\\.json$">\n  Header set Access-Control-Allow-Origin "*"\n</FilesMatch>',
    note: {
      en: 'Needs `mod_headers` enabled. On shared hosting it usually is; if the header does not appear, that module is the first thing to check.',
      es: 'Requiere `mod_headers` habilitado. En hosting compartido suele estarlo; si la cabecera no aparece, ese módulo es lo primero que hay que revisar.',
    },
  },
  {
    id: 's3',
    label: 'Amazon S3 + CloudFront',
    snippet:
      '{\n  "CORSRules": [\n    {\n      "AllowedOrigins": ["*"],\n      "AllowedMethods": ["GET", "HEAD"],\n      "AllowedHeaders": ["*"]\n    }\n  ]\n}',
    note: {
      en: 'The bucket CORS configuration. CloudFront must also be told to forward the `Origin` header, or it caches one response for every origin and the header never varies.',
      es: 'La configuración CORS del bucket. También hay que decirle a CloudFront que reenvíe la cabecera `Origin`, o guardará una sola respuesta para todos los orígenes y la cabecera nunca variará.',
    },
  },
  {
    id: 'github-pages',
    label: 'GitHub Pages',
    snippet: '',
    note: {
      en: 'GitHub Pages does not let you set response headers, and it already sends `Access-Control-Allow-Origin: *` on every response. Nothing to do — but nothing you can do either, if that ever changes.',
      es: 'GitHub Pages no permite definir cabeceras de respuesta, y ya envía `Access-Control-Allow-Origin: *` en todas. No hay nada que hacer — ni nada que puedas hacer, si eso llegara a cambiar.',
    },
  },
];

/** Look up one recipe by its id. */
export function corsRecipe(id: string): CorsRecipe | undefined {
  return CORS_RECIPES.find((entry) => entry.id === id);
}

/** The `--host` values `init` accepts. */
export const CORS_RECIPE_IDS: readonly string[] = CORS_RECIPES.map(
  (entry) => entry.id
);
