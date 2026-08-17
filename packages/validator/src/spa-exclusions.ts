/**
 * How to keep `/.well-known/cabuya.json` from being swallowed by a catch-all.
 *
 * This is the single most expensive failure in the founding analysis: four of
 * twenty hosts served their SPA's `index.html` at every path, so the manifest
 * "existed" and returned 200 with `text/html` — which the validator treats as
 * absent (the soft-404 rule, spec §1.2). Every one of those teams believed
 * they had published.
 *
 * It lives in the validator package rather than in the website because three
 * surfaces need the same words: the CLI's `init --framework`, the quickstart
 * page, and the agent skill's stack guides. A copy in each is three copies
 * that drift, and the one that drifts is the one somebody follows.
 *
 * Spanish is here too, because the quickstart is bilingual and the CLI is
 * translatable. The CLI reads `.en`; the site reads both.
 *
 * The notes are plain prose with backticks around identifiers, and nothing
 * else. Three surfaces render them — an HTML page, a terminal, and an agent's
 * context — and none of the three interprets Markdown emphasis, so a `**bold**`
 * here shows up as literal asterisks in all of them.
 */

export interface SpaExclusion {
  /** Stable id — also the `--framework` value. */
  id: string;
  /** Display name, as the framework writes it. */
  label: string;
  /** Where the file goes. Empty when the fix is routing rather than placement. */
  path?: string;
  note: { en: string; es: string };
}

export const SPA_EXCLUSIONS: readonly SpaExclusion[] = [
  {
    id: 'nextjs',
    label: 'Next.js',
    path: 'public/.well-known/cabuya.json',
    note: {
      en: 'Files under `public/` are served before the catch-all route, so placement is the whole fix. Verify anyway: a custom `rewrites` entry can still capture it.',
      es: 'Los archivos bajo `public/` se sirven antes de la ruta catch-all, así que la ubicación es todo el arreglo. Verifica de todas formas: una regla `rewrites` propia todavía puede capturarlo.',
    },
  },
  {
    id: 'vite',
    label: 'Vite / React SPA',
    path: 'public/.well-known/cabuya.json',
    note: {
      en: 'Place the file in `public/`, and exclude `/.well-known/*` from the SPA rewrite in your host config — the rewrite is what serves index.html for unknown paths.',
      es: 'Pon el archivo en `public/` y excluye `/.well-known/*` de la regla de reescritura del SPA en la configuración de tu host — esa regla es la que sirve index.html en rutas desconocidas.',
    },
  },
  {
    id: 'astro',
    label: 'Astro',
    path: 'public/.well-known/cabuya.json',
    note: {
      en: 'Static output has no catch-all, so the file is served as-is. On an SSR adapter, confirm the middleware does not rewrite unmatched paths.',
      es: 'La salida estática no tiene catch-all, así que el archivo se sirve tal cual. Con un adaptador SSR, confirma que el middleware no reescriba rutas sin coincidencia.',
    },
  },
  {
    id: 'laravel',
    label: 'Laravel',
    path: 'public/.well-known/cabuya.json',
    note: {
      en: 'Register the route before the SPA fallback, or drop the file under `public/.well-known/` — Laravel serves that directory directly.',
      es: 'Registra la ruta antes del fallback del SPA, o deja el archivo en `public/.well-known/` — Laravel sirve ese directorio directamente.',
    },
  },
  {
    id: 'php',
    label: 'PHP / Apache',
    path: 'public/.well-known/cabuya.json',
    note: {
      en: 'Add `RewriteCond %{REQUEST_URI} !^/\\.well-known/` above the front-controller rule in `.htaccess`. Without it the router answers, with a 200 and HTML.',
      es: 'Agrega `RewriteCond %{REQUEST_URI} !^/\\.well-known/` encima de la regla del front controller en `.htaccess`. Sin eso responde el router, con un 200 y HTML.',
    },
  },
  {
    id: 'django',
    label: 'Django',
    note: {
      en: 'Add a static route for `/.well-known/` before the catch-all urlpattern. Order in `urlpatterns` is the entire mechanism.',
      es: 'Agrega una ruta estática para `/.well-known/` antes del urlpattern catch-all. El orden en `urlpatterns` es todo el mecanismo.',
    },
  },
  {
    id: 'static',
    label: 'Static host',
    path: '/.well-known/cabuya.json',
    note: {
      en: 'Upload the file and then request it. Several hosts hide dot-directories by default, and the deploy will not warn you.',
      es: 'Sube el archivo y después pídelo. Varios hosts ocultan los directorios que empiezan con punto por defecto, y el despliegue no te avisa.',
    },
  },
];

/** Lookup by `--framework` value. */
export function spaExclusion(id: string): SpaExclusion | undefined {
  return SPA_EXCLUSIONS.find((entry) => entry.id === id);
}

/** The ids the CLI accepts, for its usage text. */
export const SPA_EXCLUSION_IDS: readonly string[] = SPA_EXCLUSIONS.map(
  (entry) => entry.id
);
