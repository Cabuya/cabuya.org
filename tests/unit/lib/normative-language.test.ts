/**
 * The normative-language exemption, and the duplicate that implements it.
 *
 * Two copies exist on purpose: the site imports the TypeScript, and the audit
 * scripts run under plain Node and import the `.mjs`. A duplicated rule that
 * drifts is worse than one honestly shared, so this asserts they agree —
 * including on the marker strings, which is where a reworded notice would
 * silently disable the exemption in one of the two.
 */
import { describe, expect, it } from 'vitest';

import {
  allowsEnglishBody,
  isNormativeRoute,
  NORMATIVE_NOTICE_MARKERS,
} from '@/lib/normative-language';
import { getTranslations } from '@/lib/translations';
import * as gate from '../../../scripts/lib/normative-language.mjs';

const NOTICE_EN = getTranslations('en').spec.normativeLanguageNotice;
const NOTICE_ES = getTranslations('es').spec.normativeLanguageNotice;

describe('normative-language — which routes', () => {
  it('covers the spec and schema families, in any language', () => {
    for (const path of [
      'developers/spec',
      'developers/spec/0.1',
      'developers/spec/0.1/3-the-feed',
      'es/developers/spec/0.1/3-the-feed',
      'developers/schemas/0.1/place-feed',
      'es/developers/schemas',
    ]) {
      expect(isNormativeRoute(path), path).toBe(true);
    }
  });

  it('covers nothing else', () => {
    for (const path of [
      'developers',
      'developers/quickstart',
      'es/developers/quickstart',
      'registry',
      'index',
      // A route that merely starts with the same letters.
      'developers/specialist',
    ]) {
      expect(isNormativeRoute(path), path).toBe(false);
    }
  });
});

describe('normative-language — the exemption is conditional', () => {
  it('allows English only when the notice is present', () => {
    const path = 'es/developers/spec/0.1/3-the-feed';
    expect(allowsEnglishBody(path, `intro\n\n${NOTICE_ES}\n\nbody`)).toBe(true);
    expect(allowsEnglishBody(path, `intro\n\n${NOTICE_EN}\n\nbody`)).toBe(true);
  });

  it('refuses a normative route that silently serves English', () => {
    // The case worth catching: a Spanish page rendering English with no
    // explanation is a bug, not a policy.
    expect(
      allowsEnglishBody(
        'es/developers/spec/0.1/3-the-feed',
        'body with no notice'
      )
    ).toBe(false);
  });

  it('refuses any other route, notice or not', () => {
    expect(allowsEnglishBody('es/developers/quickstart', NOTICE_ES)).toBe(
      false
    );
  });
});

describe('normative-language — the two copies agree', () => {
  it('classify the same routes', () => {
    for (const path of [
      'developers/spec/0.1/3-the-feed',
      'es/developers/schemas/0.1/manifest',
      'developers/quickstart',
      'registry',
    ]) {
      expect(gate.isNormativeRoute(path), path).toBe(isNormativeRoute(path));
    }
  });

  it('carry the same markers', () => {
    expect(gate.NORMATIVE_NOTICE_MARKERS).toEqual(NORMATIVE_NOTICE_MARKERS);
  });

  it('reach the same verdict on the same input', () => {
    const path = 'es/developers/spec/0.1/3-the-feed';
    for (const content of [NOTICE_ES, NOTICE_EN, 'nothing']) {
      expect(gate.allowsEnglishBody(path, content)).toBe(
        allowsEnglishBody(path, content)
      );
    }
  });
});

describe('normative-language — the markers match the shipped notice', () => {
  /**
   * The failure this catches: someone rewords the notice, the marker no longer
   * appears in it, and every Spanish spec page silently loses its exemption —
   * or worse, keeps it while the notice says something else entirely.
   */
  it('each language’s notice contains a marker', () => {
    for (const notice of [NOTICE_EN, NOTICE_ES]) {
      expect(
        NORMATIVE_NOTICE_MARKERS.some((marker) => notice.includes(marker)),
        `no marker found in: ${notice}`
      ).toBe(true);
    }
  });
});
