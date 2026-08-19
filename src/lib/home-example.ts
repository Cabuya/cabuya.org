/**
 * The landing page's worked example: what an app that adopts the protocol
 * ends up publishing, shown as the two URLs and one trimmed record.
 *
 * Shared by `WhatHappens.astro` (the rendered block) and `home-markdown.ts`
 * (the twin), so the page and its `.md` twin can never show different
 * artifacts. Language-neutral on purpose: URLs and JSON read the same in both
 * languages, and keeping them out of the translation objects keeps the
 * landing-copy constraints (no numerals, no named apps) checkable over pure
 * copy.
 *
 * Rule-0: everything here is `example.org` and the quickstart fixture's
 * fictional shelter — no real publisher is named or implied.
 */

/** The manifest URL every adopter publishes, shown host-relative. */
export const EXAMPLE_MANIFEST_URL = 'example.org/.well-known/cabuya.json';

/**
 * The feed URL from the quickstart's example manifest. An example name, not a
 * rule: the manifest declares whichever URL the publisher serves, file or
 * endpoint.
 */
export const EXAMPLE_FEED_URL = 'example.org/cabuya/places.json';

/**
 * One record, trimmed from `tests/fixtures/quickstart/feed.json` to the
 * fields a first-time reader should meet: what it is, where it is, and the
 * public page every action button leads back to.
 */
export const EXAMPLE_RECORD = `{
  "name": "Coliseo Municipal",
  "place_kind": "shelter",
  "municipality_text": "Pereira",
  "neighborhood_text": "Centro",
  "lifecycle_status": "active",
  "public_url": "https://example.org/places/coliseo"
}`;
