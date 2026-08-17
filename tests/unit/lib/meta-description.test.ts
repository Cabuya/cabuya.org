/**
 * Meta descriptions must land in the 130–160 band `CLAUDE.md` requires, without
 * inventing text to get there.
 *
 * A sitewide audit found most URLs outside the band, and the cause was
 * structural rather than editorial: pages handed the layout a field authored
 * for a different job. `truncateToBand` is the half of the fix that survived —
 * it trims to the ceiling at a boundary a reader would have chosen. Pages
 * compose the text itself, and `seo:check` measures the result.
 */
import { describe, expect, it } from 'vitest';

import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  truncateToBand,
} from '@/lib/meta-description';

const LONG =
  'How to contribute to the Cabuya Protocol — publish a conforming feed, consume a peer under the rules, or open an RFC. Every kind of contribution has a clear path and a real effect on what ships.';

describe('truncateToBand', () => {
  it('leaves text already inside the band alone', () => {
    expect(truncateToBand('short text', DESCRIPTION_MAX)).toBe('short text');
  });

  it('never exceeds the maximum', () => {
    expect(truncateToBand(LONG, DESCRIPTION_MAX).length).toBeLessThanOrEqual(
      DESCRIPTION_MAX
    );
  });

  it('never cuts a word in half', () => {
    const out = truncateToBand(LONG, DESCRIPTION_MAX);
    const tail = out.replace(/…$/, '').split(' ').pop() ?? '';
    expect(LONG.split(/\s+/)).toContain(tail);
  });

  it('prefers a sentence boundary when one leaves enough text', () => {
    const out = truncateToBand(LONG, DESCRIPTION_MAX, 0);
    expect(out.endsWith('.')).toBe(true);
    expect(out).not.toContain('…');
  });

  it('REGRESSION: does not cut back below the minimum to find a full stop', () => {
    // The first version preferred the sentence boundary unconditionally, so
    // appending a clause to a 126-char lead and then trimming returned the
    // 126-char lead — a silent no-op on 131 pages.
    const lead =
      'How a delivery gets verified: the window, the evidence, and the administrative review between a contribution and a receipt.';
    const extended = `${lead} Published by Corag, where aid gets coordinated and every delivery is backed by evidence.`;
    const out = truncateToBand(extended, DESCRIPTION_MAX, DESCRIPTION_MIN);
    expect(out.length).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
    expect(out.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(out).not.toBe(lead);
  });
});
