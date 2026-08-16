/**
 * Fixture builders.
 *
 * Every fixture is derived from one conforming baseline by an explicit
 * mutation, so a "must-fail" case differs from its "near-miss" twin in
 * exactly the property under test — which is what makes a passing near-miss
 * meaningful evidence rather than a coincidence.
 *
 * All values are synthetic. No real publisher, person or contact appears in
 * any fixture, ever (spec §7).
 */

export type Json = Record<string, unknown>;

/** A minimal record that satisfies every implemented error check. */
export function place(over: Json = {}): Json {
  return {
    id: 'p-001',
    publisher_id: 'example-app',
    name: 'Coliseo Municipal',
    place_kind: 'shelter',
    municipality_code: '66001',
    address_text: 'Avenida Ejemplo 12-34',
    lat: 4.8133,
    lon: -75.6961,
    lifecycle_status: 'active',
    service_status: 'open',
    last_confirmed_at: '2026-08-16T03:00:00Z',
    updated_at: '2026-08-15T10:00:00Z',
    source: { source_id: 'example-app' },
    public_url: 'https://example-app.org/places/p-001',
    ...over,
  };
}

/** A minimal feed envelope that satisfies every implemented error check. */
export function feed(over: Json = {}, places: Json[] = [place()]): Json {
  return {
    last_updated: '2026-08-16T04:00:00Z',
    ttl: 300,
    version: '0.1.0',
    publisher_id: 'example-app',
    license: 'CC-BY-4.0',
    permitted_use: ['display', 'aggregate'],
    attribution: 'Example App',
    data: { places },
    ...over,
  };
}

/** Same, but for a single mutated record. */
export function feedWith(over: Json): Json {
  return feed({}, [place(over)]);
}

/** Drop a key (rather than setting it undefined, which JSON keeps). */
export function without<T extends Json>(object: T, key: string): Json {
  const copy: Json = { ...object };
  delete copy[key];
  return copy;
}
