import { describe, expect, it } from 'vitest';

import {
  formatEcosystemDisplayUrl,
  resolveEcosystemDevelopersUrl,
} from '@/lib/ecosystem-view';

describe('formatEcosystemDisplayUrl', () => {
  it('strips protocol, www, and trailing slash', () => {
    expect(formatEcosystemDisplayUrl('https://www.example.com/')).toBe(
      'example.com'
    );
  });

  it('keeps a meaningful path', () => {
    expect(formatEcosystemDisplayUrl('https://soygogo.com/pereira-ayuda')).toBe(
      'soygogo.com/pereira-ayuda'
    );
  });

  it('falls back for non-URL strings', () => {
    expect(formatEcosystemDisplayUrl('not-a-url')).toBe('not-a-url');
  });
});

describe('resolveEcosystemDevelopersUrl', () => {
  it('prefixes site-relative paths', () => {
    expect(resolveEcosystemDevelopersUrl('/developers', '/en')).toBe(
      '/en/developers'
    );
    expect(resolveEcosystemDevelopersUrl('/developers', '')).toBe(
      '/developers'
    );
  });

  it('passes through absolute URLs', () => {
    expect(
      resolveEcosystemDevelopersUrl(
        'https://pereiraresponde.co/developers/example/',
        '/en'
      )
    ).toBe('https://pereiraresponde.co/developers/example/');
  });

  it('returns undefined when missing', () => {
    expect(resolveEcosystemDevelopersUrl(undefined, '')).toBeUndefined();
  });
});
