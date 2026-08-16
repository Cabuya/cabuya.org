/**
 * The semantic pass: every rule proven to fire on its must-fail fixture AND
 * to stay silent on the near-miss twin that differs in exactly the property
 * under test. A check that cannot be silenced is a check nobody trusts.
 */
import { describe, expect, it } from 'vitest';

import {
  envelopeChecks,
  fold,
  recordChecks,
  STATE_TOKENS,
  semanticPass,
} from '../src/passes/semantic.js';
import { feed, feedWith, type Json, place } from './fixtures/builders.js';

const ids = (findings: { id: string }[]) => findings.map((f) => f.id);
const env = (over: Json = {}) => ids(envelopeChecks(feed(over) as Json));
const rec = (over: Json) => ids(recordChecks(feedWith(over) as Json));

describe('the baseline is silent', () => {
  it('a conforming feed produces no semantic findings', () => {
    expect(
      semanticPass.run({
        document: feed(),
        schemas: {},
        profile: 'core',
        probes: {},
      } as never)
    ).toEqual([]);
  });
});

describe('envelope rules', () => {
  it('ENV002 fires on a timestamp without an offset, silent with Z', () => {
    expect(env({ last_updated: '2026-08-16T04:00:00' })).toContain('ENV002');
    expect(env({ last_updated: '2026-08-16T04:00:00-05:00' })).not.toContain(
      'ENV002'
    );
  });

  it('ENV004 fires on a free-text licence without a URL, silent on SPDX', () => {
    expect(env({ license: 'our own terms' })).toContain('ENV004');
    expect(
      env({ license: 'our own terms', license_url: 'https://x.org/l' })
    ).not.toContain('ENV004');
    expect(env({ license: 'CC0-1.0' })).not.toContain('ENV004');
  });

  it('LIC001 warns on share-alike, silent on permissive', () => {
    expect(env({ license: 'CC-BY-SA-4.0' })).toContain('LIC001');
    expect(env({ license: 'CC-BY-4.0' })).not.toContain('LIC001');
  });

  it('ENV005 fires when permitted_use is absent or out of enum', () => {
    const noConsent = feed();
    delete (noConsent as Json).permitted_use;
    expect(ids(envelopeChecks(noConsent as Json))).toContain('ENV005');
    expect(env({ permitted_use: ['display', 'sell_it'] })).toContain('ENV005');
    expect(env({ permitted_use: ['ai_answer'] })).not.toContain('ENV005');
  });

  it('ENV006 fires on an unsupported future MAJOR, silent on 0.x', () => {
    expect(env({ version: '2.0.0' })).toContain('ENV006');
    expect(env({ version: '0.1.0' })).not.toContain('ENV006');
  });

  it('ENV008 fires on an implausible ttl, silent on a sane one', () => {
    expect(env({ ttl: 0 })).toContain('ENV008');
    expect(env({ ttl: 999999 })).toContain('ENV008');
    expect(env({ ttl: 300 })).not.toContain('ENV008');
  });

  it('LIC002 notes a missing attribution string', () => {
    const noAttr = feed();
    delete (noAttr as Json).attribution;
    expect(ids(envelopeChecks(noAttr as Json))).toContain('LIC002');
    expect(env()).not.toContain('LIC002');
  });
});

describe('record rules', () => {
  it('REC001 fires on an empty-string confirmation, silent on null and on a timestamp', () => {
    expect(rec({ last_confirmed_at: '' })).toContain('REC001');
    expect(rec({ last_confirmed_at: null })).not.toContain('REC001');
    expect(rec({ last_confirmed_at: '2026-08-16T03:00:00Z' })).not.toContain(
      'REC001'
    );
  });

  it('REC002 fires when the qualifier is embedded in the local id', () => {
    expect(rec({ id: 'example-app:p-001' })).toContain('REC002');
    expect(rec({ id: 'p-001' })).not.toContain('REC002');
  });

  it('REC003 fires on minting inside another publisher’s namespace', () => {
    expect(rec({ publisher_id: 'someone-else' })).toContain('REC003');
    expect(rec({ publisher_id: 'example-app' })).not.toContain('REC003');
  });

  it('REC018 fires on a duplicate id within one feed', () => {
    const dupes = feed({}, [place(), place()]);
    expect(ids(recordChecks(dupes as Json))).toContain('REC018');
    const distinct = feed({}, [place(), place({ id: 'p-002' })]);
    expect(ids(recordChecks(distinct as Json))).not.toContain('REC018');
  });

  it('REC004 fires with no locator at all; REC005 warns with only one', () => {
    const noLocator = place();
    delete (noLocator as Json).address_text;
    delete (noLocator as Json).lat;
    delete (noLocator as Json).lon;
    const bare = ids(recordChecks(feed({}, [noLocator]) as Json));
    expect(bare).toContain('REC004');

    const addressOnly = place();
    delete (addressOnly as Json).lat;
    delete (addressOnly as Json).lon;
    const partial = ids(recordChecks(feed({}, [addressOnly]) as Json));
    expect(partial).toContain('REC005');
    expect(partial).not.toContain('REC004');

    expect(rec({})).not.toContain('REC005');
  });

  it('REC008 fires when the code is null and no text accompanies it', () => {
    expect(rec({ municipality_code: null })).toContain('REC008');
    expect(
      rec({ municipality_code: null, municipality_text: 'Pereira' })
    ).not.toContain('REC008');
  });

  it('REC010 fires on state in the name — accent- and case-folded', () => {
    expect(rec({ name: 'Coliseo (cerrado ahora)' })).toContain('REC010');
    expect(rec({ name: 'Coliseo CERRADO' })).toContain('REC010');
    expect(rec({ name: 'Colegio Abierto' })).toContain('REC010');
    // The near-miss: a name that merely contains the letters, not the word.
    expect(rec({ name: 'Centro Cerrajería Municipal' })).not.toContain(
      'REC010'
    );
    expect(rec({ name: 'Coliseo Municipal' })).not.toContain('REC010');
  });

  it('REC011 fires when the name and lifecycle_status contradict each other', () => {
    expect(
      rec({ name: 'Coliseo (cerrado)', lifecycle_status: 'active' })
    ).toContain('REC011');
    expect(
      rec({ name: 'Coliseo (cerrado)', lifecycle_status: 'closed' })
    ).not.toContain('REC011');
  });

  it('REC012 fires when last_confirmed_at is a copy of updated_at (CR-1)', () => {
    const stamp = '2026-08-16T03:00:00Z';
    expect(rec({ updated_at: stamp, last_confirmed_at: stamp })).toContain(
      'REC012'
    );
    expect(
      rec({ updated_at: '2026-08-15T10:00:00Z', last_confirmed_at: stamp })
    ).not.toContain('REC012');
  });

  it('REC013 warns when a temporary kind carries no expiry', () => {
    expect(rec({ place_kind: 'collection_center' })).toContain('REC013');
    expect(
      rec({
        place_kind: 'collection_center',
        expires_at: '2026-09-01T00:00:00Z',
      })
    ).not.toContain('REC013');
    expect(rec({ place_kind: 'hospital' })).not.toContain('REC013');
  });

  it('REC014 fires on unqualified and self-referential same_as claims', () => {
    expect(rec({ same_as: ['p-999'] })).toContain('REC014');
    expect(rec({ same_as: ['example-app:p-001'] })).toContain('REC014'); // self
    expect(rec({ same_as: ['peer-app:p-77'] })).not.toContain('REC014');
  });

  it('REC016 fires on an un-namespaced extension', () => {
    expect(rec({ x_note: 'hi' })).toContain('REC016');
    expect(rec({ x_example_note: 'hi' })).not.toContain('REC016');
  });

  it('REC017 fires when a localized field has no es entry', () => {
    expect(rec({ name: [{ text: 'Shelter', language: 'en' }] })).toContain(
      'REC017'
    );
    expect(
      rec({
        name: [
          { text: 'Albergue', language: 'es' },
          { text: 'Shelter', language: 'en' },
        ],
      })
    ).not.toContain('REC017');
    expect(rec({ name: 'Albergue' })).not.toContain('REC017');
  });
});

describe('helpers', () => {
  it('fold removes accents and case', () => {
    expect(fold('CERRADÓ ñ')).toBe('cerrado n');
  });

  it('every state token is matched by the CR-2 check', () => {
    for (const token of STATE_TOKENS) {
      expect(rec({ name: `Sitio ${token}` }), token).toContain('REC010');
    }
  });
});
