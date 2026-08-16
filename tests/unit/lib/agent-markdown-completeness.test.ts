/**
 * The entity-reference helpers behind the agent-Markdown contract
 * (`docs/aeo/MARKDOWN_FOR_AGENTS.md`).
 *
 * These are pure — they take resolved data and return a string — which is what
 * makes the contract testable without the content layer. They cover the two
 * failure modes the contract exists to prevent: a bare slug where a name
 * belongs, and a dangling separator when a detail segment is empty.
 */
import { describe, expect, it } from 'vitest';

import {
  entityLine,
  imageLine,
  mdHref,
  mdLabel,
  sectionHeading,
} from '@/lib/markdown-for-agents';

describe('entity reference helpers', () => {
  it('builds a language-correct `.md` href', () => {
    expect(mdHref('en', 'speakers/sergio-florez')).toBe(
      '/en/speakers/sergio-florez.md'
    );
    expect(mdHref('es', 'speakers/sergio-florez')).toBe(
      '/speakers/sergio-florez.md'
    );
  });

  it('drops empty detail segments instead of leaving a dangling dash', () => {
    expect(entityLine('Ana', '/speakers/ana.md')).toBe(
      '- [Ana](/speakers/ana.md)'
    );
    expect(
      entityLine('Ana', '/speakers/ana.md', '', undefined, 'Engineer')
    ).toBe('- [Ana](/speakers/ana.md) — Engineer');
  });

  it('keeps an image even when its alt text is empty', () => {
    expect(imageLine('', '/a.webp')).toBe('![](/a.webp)');
  });

  it('localizes section headings', () => {
    expect(mdLabel('en', 'speakers')).toBe('Speakers');
    expect(mdLabel('es', 'speakers')).toBe('Ponentes');
  });
});
