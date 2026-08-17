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

/**
 * Whether the rendered version is still a draft.
 *
 * False since 0.1 was declared normative. The specification still changes —
 * through the RFC process, which is what its introduction says — but it is no
 * longer labelled a proposal, and nothing on the site announces one.
 */
export const SPEC_IS_DRAFT = false;

/**
 * Whether the draft state gets its own bar above the header.
 *
 * Separate from `SPEC_IS_DRAFT` on purpose: the specification *is* a draft,
 * and anything that reasons about that must keep reading the flag above. This
 * one is presentation — the bar is off while the landing is being tuned to
 * fill the viewport, because it took a fixed slice off the top of every page.
 *
 * Turning it off does not drop the disclosure: `footer.specStatus` states
 * «Specification 0.1 — draft under review» on every page, the specification
 * index carries its own status block, and `/developers/spec/*` labels the
 * version. Flip this back to `true` to restore the bar.
 */
export const SHOW_SPEC_BANNER = false;
