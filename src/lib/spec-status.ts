/**
 * The specification's release state, in one boolean.
 *
 * Read by the site banner and by anything that must not present a draft as
 * settled. Flipping this to `false` is part of the 1.0 release checklist —
 * `docs/DEVELOPMENT_COMMANDS.md` and the release skill both name it, so it
 * cannot be the thing everyone forgets on launch day.
 */

/** The version whose text the site currently renders. */
export const SPEC_VERSION = '0.1';

/** True while that version is a draft under review. */
export const SPEC_IS_DRAFT = true;
