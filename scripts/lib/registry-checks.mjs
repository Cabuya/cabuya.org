/**
 * The testable core of the `registry:check` gate.
 *
 * Asserts entry integrity for `registry/`: schema validity, id/URL
 * uniqueness, filename discipline, org-level contact, and the B6
 * no-HTML-in-data rule. Measured values never appear here by construction —
 * the schema's `additionalProperties: false` refuses them.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { newAjv } from './spec-checks.mjs';

/** Personal-looking email local parts the org-level rule flags. */
const ORG_LOCAL_PARTS =
  /^(info|team|equipo|contacto|contact|hola|hello|hi|soporte|support|admin|maintainers|security|conduct|press|prensa)@/i;

const HTML_PATTERN = /<[a-zA-Z][^>]*>|&\w+;|javascript:/;

function loadDir(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((file) => {
      const path = join(dir, file);
      try {
        return { file, path, data: JSON.parse(readFileSync(path, 'utf-8')) };
      } catch (error) {
        return { file, path, error: error.message };
      }
    });
}

export function checkRegistry(registryDir) {
  const findings = [];
  const ajv = newAjv();

  const compile = (name) => {
    const path = join(registryDir, 'schema', name);
    return ajv.compile(JSON.parse(readFileSync(path, 'utf-8')));
  };

  const validators = {
    publishers: compile('publisher-entry.schema.json'),
    'official-sources': compile('official-source.schema.json'),
    events: compile('event.schema.json'),
  };
  const idField = {
    publishers: 'publisher_id',
    'official-sources': 'id',
    events: 'event_id',
  };

  const seenUrls = new Map(); // url -> file
  const eventIds = new Set();
  const publisherEvents = [];

  for (const [collection, validator] of Object.entries(validators)) {
    const entries = loadDir(join(registryDir, collection));
    const seenIds = new Set();

    for (const entry of entries) {
      if (entry.error) {
        findings.push({
          check: 'parse',
          file: entry.path,
          message: `does not parse: ${entry.error}`,
        });
        continue;
      }
      const { data, path, file } = entry;

      if (!validator(data)) {
        for (const err of validator.errors ?? []) {
          findings.push({
            check: 'schema',
            file: path,
            message: `${err.instancePath || '/'} ${err.message}`,
          });
        }
      }

      const id = data[idField[collection]];
      if (id) {
        if (seenIds.has(id)) {
          findings.push({
            check: 'id-unique',
            file: path,
            message: `duplicate id "${id}"`,
          });
        }
        seenIds.add(id);
        if (basename(file, '.json') !== id) {
          findings.push({
            check: 'filename',
            file: path,
            message: `filename must equal the id ("${id}.json")`,
          });
        }
      }

      // URL uniqueness across canonical + aliases (publishers only)
      if (collection === 'publishers') {
        const urls = [data.canonical_url, ...(data.aliases ?? [])].filter(
          Boolean
        );
        for (const url of urls) {
          const normalized = url.replace(/\/+$/, '').toLowerCase();
          if (seenUrls.has(normalized)) {
            findings.push({
              check: 'url-unique',
              file: path,
              message: `canonical URL or alias collides between ${seenUrls.get(normalized)} and ${file} — registry keys are URLs, so two entries claiming one URL is an identity conflict a reviewer must resolve`,
            });
          }
          seenUrls.set(normalized, file);
        }
        if (data.contact_org && !ORG_LOCAL_PARTS.test(data.contact_org)) {
          findings.push({
            check: 'contact-org-level',
            file: path,
            message:
              'contact_org does not look like an org-level role address (value not echoed) — personal contacts are never merged',
          });
        }
        if (data.events) publisherEvents.push({ path, events: data.events });
      }

      if (collection === 'events' && data.event_id) {
        eventIds.add(data.event_id);
      }

      // B6: no HTML/entities in any string field, at any depth
      const walk = (value, pointer) => {
        if (typeof value === 'string') {
          if (HTML_PATTERN.test(value)) {
            findings.push({
              check: 'B6-html',
              file: path,
              message: `HTML-like content at ${pointer} (value not echoed) — registry entries are data, never markup`,
            });
          }
        } else if (Array.isArray(value)) {
          value.forEach((v, i) => {
            walk(v, `${pointer}/${i}`);
          });
        } else if (value && typeof value === 'object') {
          for (const [k, v] of Object.entries(value))
            walk(v, `${pointer}/${k}`);
        }
      };
      walk(data, '');
    }
  }

  // Referential integrity: publisher events must exist
  for (const { path, events } of publisherEvents) {
    for (const event of events) {
      if (!eventIds.has(event)) {
        findings.push({
          check: 'event-ref',
          file: path,
          message: `references unknown event "${event}"`,
        });
      }
    }
  }

  return findings;
}
