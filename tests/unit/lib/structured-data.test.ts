/**
 * Structured data: the builders, the inventory, and the mirror.
 *
 * Structured data is invisible. Nothing in a browser renders it, no page looks
 * wrong without it, and a diff that deletes an emitter reads as a deleted line
 * rather than as a lost rich result. That is why the inventory is asserted
 * rather than trusted — and why the version that shipped with this site went
 * unnoticed while it described `meetups`, `speakers` and `blog` routes from a
 * different project and therefore asserted nothing at all.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';
import {
  breadcrumbList,
  JSONLD_MATRIX,
  normalizeRoute,
  registryDataset,
  requiredTypesFor,
} from '@/lib/structured-data';
// @ts-expect-error — plain ESM mirror, no types; shared with the SEO gate.
import {
  JSONLD_MATRIX as GATE_MATRIX,
  normalizeRoute as gateNormalize,
  requiredTypesFor as gateRequired,
  SITEWIDE_TYPES,
} from '../../../scripts/lib/jsonld-matrix.mjs';

describe('the gate mirror agrees with the site', () => {
  it('covers the same kinds, in the same order', () => {
    expect(GATE_MATRIX.map((entry: { kind: string }) => entry.kind)).toEqual(
      JSONLD_MATRIX.map((entry) => entry.kind)
    );
  });

  it('requires the same types for each kind', () => {
    for (const [index, entry] of JSONLD_MATRIX.entries()) {
      expect(GATE_MATRIX[index].required, entry.kind).toEqual(entry.required);
    }
  });

  it('classifies the same routes the same way', () => {
    const routes = [
      '/registry',
      '/registry/corag',
      '/developers/faq',
      '/developers/consume',
      '/developers/spec/0.1/3-the-feed',
      '/developers/schemas/0.1/manifest',
      '/rfcs/0001',
      '/governance',
      '/',
    ];

    for (const route of routes) {
      const site = requiredTypesFor(route);
      // The gate receives paths without a leading slash, as `dist` yields them.
      const gate = gateRequired(route.replace(/^\//, ''));
      expect(gate?.kind ?? null, route).toBe(site?.kind ?? null);
      expect(gate?.required ?? null, route).toEqual(site?.required ?? null);
    }
  });

  it('strips a language prefix the same way', () => {
    expect(normalizeRoute('/es/registry')).toBe('/registry');
    expect(gateNormalize('es/registry')).toBe('registry');
    expect(normalizeRoute('/es')).toBe('/');
    expect(gateNormalize('es')).toBe('');
  });

  it('names the sitewide pair', () => {
    expect(SITEWIDE_TYPES).toEqual(['WebSite', 'Organization']);
  });
});

describe('breadcrumbs', () => {
  it('numbers the steps from one', () => {
    const graph = breadcrumbList([
      { name: 'Registry', url: 'https://cabuya.org/registry' },
      { name: 'corag' },
    ]) as { itemListElement: Array<Record<string, unknown>> };

    expect(graph.itemListElement[0].position).toBe(1);
    expect(graph.itemListElement[0].item).toBe('https://cabuya.org/registry');
    // The last step is the current page and carries no URL: a breadcrumb that
    // links its own page is a link to nowhere.
    expect(graph.itemListElement[1].item).toBeUndefined();
    expect(graph.itemListElement[1].position).toBe(2);
  });

  it('emits nothing for a single step', () => {
    // One item is not a trail, and Google ignores it. Emitting it is noise.
    expect(breadcrumbList([{ name: 'Home' }])).toBeNull();
    expect(breadcrumbList([])).toBeNull();
  });
});

describe('the registry Dataset', () => {
  const dataset = registryDataset({
    siteUrl: 'https://cabuya.org',
    lang: 'en',
    name: 'Registry',
    description: 'Applications that publish Cabuya feeds.',
    publisherCount: 4,
    repositoryUrl: 'https://github.com/Cabuya/cabuya.org',
  }) as Record<string, unknown>;

  it('names a licence a machine can resolve', () => {
    // A licence name a consumer cannot dereference is a licence it must treat
    // as absent — which is the exact failure the protocol's own `license`
    // field exists to prevent.
    expect(dataset.license).toBe(
      'https://creativecommons.org/publicdomain/zero/1.0/'
    );
    expect(dataset.isAccessibleForFree).toBe(true);
  });

  it('distributes the data, not the page describing it', () => {
    const distribution = dataset.distribution as Array<Record<string, string>>;
    expect(distribution.length).toBe(2);
    expect(distribution[0].contentUrl).toContain('/tree/main/registry');
    expect(distribution[1].contentUrl).toBe(
      'https://cabuya.org/registry/status.json'
    );
    for (const entry of distribution) {
      expect(entry.encodingFormat).toBe('application/json');
    }
  });

  it('points at the Spanish page when it is the Spanish page', () => {
    const es = registryDataset({
      siteUrl: 'https://cabuya.org',
      lang: 'es',
      name: 'Registro',
      description: 'Aplicaciones que publican feeds Cabuya.',
      publisherCount: 4,
      repositoryUrl: 'https://github.com/Cabuya/cabuya.org',
    }) as Record<string, unknown>;
    expect(es.url).toBe('https://cabuya.org/es/registry');
    expect(es.inLanguage).toBe('es');
  });

  it('claims no rating, review or offer', () => {
    // The registry lists and measures; it does not recommend. A rating type
    // would be the machine-readable version of the endorsement the page
    // spends two paragraphs refusing to make.
    const serialized = JSON.stringify(dataset);
    for (const forbidden of [
      'AggregateRating',
      'Review',
      'Offer',
      'ratingValue',
    ]) {
      expect(serialized, forbidden).not.toContain(forbidden);
    }
  });
});

const DIST = join(process.cwd(), 'dist');

describe.skipIf(!existsSync(DIST))('the built pages', () => {
  const read = (route: string): string =>
    readFileSync(join(DIST, route, 'index.html'), 'utf-8');

  const graphs = (html: string): Array<Record<string, unknown>> =>
    [
      ...html.matchAll(
        /<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs
      ),
    ].map((match) => JSON.parse(match[1]) as Record<string, unknown>);

  it('emit only JSON that parses', () => {
    for (const route of [
      'registry',
      'developers/faq',
      'rfcs/0001',
      'es/registry',
    ]) {
      expect(() => graphs(read(route)), route).not.toThrow();
    }
  });

  it('carry a Dataset on the registry, in both languages', () => {
    for (const route of ['registry', 'es/registry']) {
      const dataset = graphs(read(route)).find(
        (graph) => graph['@type'] === 'Dataset'
      );
      expect(dataset, route).toBeTruthy();
      expect(dataset?.license).toContain('publicdomain/zero');
    }
  });

  it('carry a breadcrumb trail whose last step is the page itself', () => {
    const trail = graphs(read('registry/corag')).find(
      (graph) => graph['@type'] === 'BreadcrumbList'
    ) as { itemListElement: Array<Record<string, unknown>> } | undefined;

    expect(trail).toBeTruthy();
    const steps = trail?.itemListElement ?? [];
    expect(steps[steps.length - 1].item).toBeUndefined();
    expect(steps[steps.length - 1].name).toBe('corag');
  });

  it('never emit a google-site-verification meta', () => {
    // Search Console verification is DNS-only here, and a meta tag would be a
    // second, weaker claim on the same domain.
    for (const route of ['registry', 'developers', 'es']) {
      expect(read(route), route).not.toContain('google-site-verification');
    }
  });

  it('canonicalize a versioned specification URL to itself', () => {
    const html = read('developers/spec/0.1/3-the-feed');
    expect(html).toContain(
      '<link rel="canonical" href="https://cabuya.org/developers/spec/0.1/3-the-feed/"'
    );
    // Never to "latest": a normative document that resolves to a moving target
    // cannot be cited.
    expect(html).not.toContain('/spec/latest');
  });

  it('pair every page with its other language and an x-default', () => {
    for (const route of ['registry', 'es/registry', 'governance']) {
      const html = read(route);
      const alternates = [
        ...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g),
      ].map((match) => match[1]);
      expect(alternates.sort(), route).toEqual(['en', 'es', 'x-default']);
    }
  });
});
