import { describe, expect, it } from 'vitest';

import { validateEcosystemJoinForm } from '@/lib/ecosystem-join-form';

const messages = {
  required: 'required',
  email: 'email',
  url: 'url',
  category: 'category',
};

describe('validateEcosystemJoinForm', () => {
  it('accepts a complete https submission', () => {
    const errors = validateEcosystemJoinForm(
      {
        appName: 'Acopio',
        appUrl: 'https://alluda.online/',
        what: 'Collection centers',
        how: 'Pick a city',
        category: 'logistics',
        name: 'Ada',
        email: 'ada@example.com',
        notes: '',
      },
      messages
    );
    expect(errors).toEqual({});
  });

  it('rejects http URLs and bad email', () => {
    const errors = validateEcosystemJoinForm(
      {
        appName: 'X',
        appUrl: 'http://example.com',
        what: 'a',
        how: 'b',
        category: 'other',
        name: 'Ada',
        email: 'not-an-email',
        notes: '',
      },
      messages
    );
    expect(errors.appUrl).toBe('url');
    expect(errors.email).toBe('email');
  });

  it('requires category from the allowlist', () => {
    const errors = validateEcosystemJoinForm(
      {
        appName: 'X',
        appUrl: 'https://example.com',
        what: 'a',
        how: 'b',
        category: 'nope',
        name: 'Ada',
        email: 'ada@example.com',
        notes: '',
      },
      messages
    );
    expect(errors.category).toBe('category');
  });
});
