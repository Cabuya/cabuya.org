/**
 * Which prose routes the portal serves.
 *
 * Derived from the English entries of the `docs` collection: a page exists when
 * its Markdown does, which means adding one is adding two files and nothing
 * else. The Spanish route set is the same by construction — the renderer throws
 * if a translation is missing, so a half-translated page fails the build rather
 * than shipping a 404 on `/es`.
 *
 * Two entries are excluded. `index` is the portal home, which is a composed
 * layout rather than prose and has its own component. Anything under a
 * subdirectory belongs to a bespoke tree (the spec reader, the schema
 * reference) and is not a flat prose route.
 */
import { getCollection } from 'astro:content';

export async function docsRoutes(): Promise<string[]> {
  const entries = await getCollection('docs');
  return entries
    .filter((entry) => entry.id.startsWith('en/'))
    .map((entry) => entry.id.slice(3))
    .filter((slug) => slug !== 'index' && !slug.includes('/'))
    .sort();
}
