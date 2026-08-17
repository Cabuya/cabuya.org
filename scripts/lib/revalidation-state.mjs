/**
 * The badge state machine.
 *
 * Separated from the script that runs it so it can be tested without a network,
 * a clock or a KV namespace: given the previous record and one run's outcome,
 * what does the registry now say? Every interesting rule in the revalidation
 * cron is in this file, and every one of them exists because of a specific way
 * the naive version would be unfair to a publisher.
 *
 * ## The rules, and who they protect
 *
 * **Two consecutive failures, at least an hour apart, before `unreachable`.**
 * Volunteer infrastructure has bad afternoons. A single failed fetch is far
 * more likely to be a transient than an outage, and flipping a public badge to
 * "unreachable" on the strength of one timeout would publish a claim about
 * somebody's reliability that we could not defend. The hour is there because
 * two runs a minute apart during the same blip are one observation, not two.
 *
 * **Transport failure never becomes `failing`.** The CLI distinguishes exit 3
 * from exit 1 precisely so this distinction survives, and it must survive all
 * the way to the badge: "we could not reach you" and "your data is wrong" are
 * different statements about a publisher, and only one of them is about them.
 *
 * **Staleness is computed from the feed, not from the run.** A feed the cron
 * checked ten minutes ago whose `last_updated` is three weeks old is stale; a
 * feed checked yesterday and updated this morning is not. Staleness is a fact
 * about the data, and measuring it from our own schedule would make it a fact
 * about us.
 *
 * **A previously-measured state is never silently overwritten by absence.** If
 * a run cannot produce an outcome at all, the previous record survives with its
 * own timestamp rather than being replaced with `unmeasured`.
 */

/** Feed age past which a passing entry is reported `stale`. */
export const STALE_AFTER_HOURS = 24 * 7;

/** Failed runs, an hour apart, before the badge says `unreachable`. */
export const FAILURES_BEFORE_UNREACHABLE = 2;

/** Minimum gap between two failures for them to count as two. */
export const FAILURE_GAP_MS = 60 * 60 * 1000;

/**
 * What one run observed.
 *
 * `kind` mirrors the CLI's exit-code families rather than inventing a parallel
 * vocabulary: `pass` is 0 or 2, `fail` is 1, `transport` is 3. A usage or
 * internal error (4, 5) is our bug and produces `skip`, which leaves the
 * previous record untouched — a broken validator must never be able to mark a
 * publisher as failing.
 */
export function outcomeFromExitCode(code) {
  if (code === 0 || code === 2) return 'pass';
  if (code === 1) return 'fail';
  if (code === 3) return 'transport';
  return 'skip';
}

/**
 * Compute the next record.
 *
 * @param {object|null} previous  The record currently in KV, or null.
 * @param {object} run            `{ kind, level, failingChecks, feedAgeHours, at }`
 * @returns {object|null}         The record to write, or null to leave KV alone.
 */
export function nextStatus(previous, run) {
  const { kind, at } = run;

  if (kind === 'skip') {
    // Our failure, not theirs. Nothing is written and nothing is claimed.
    return null;
  }

  const base = {
    publisher_id: run.publisherId,
    checked_at: at,
    version: run.version,
  };

  if (kind === 'pass') {
    const stale =
      typeof run.feedAgeHours === 'number' &&
      run.feedAgeHours > STALE_AFTER_HOURS;
    return {
      ...base,
      state: stale ? 'stale' : 'conforming',
      level: run.level ?? null,
      feed_age_hours: run.feedAgeHours,
      consecutive_failures: 0,
    };
  }

  if (kind === 'fail') {
    return {
      ...base,
      state: 'failing',
      level: run.level ?? null,
      failing_checks: run.failingChecks ?? [],
      consecutive_failures: 0,
    };
  }

  /*
   * Transport. Count it, and only cross into `unreachable` on the second one
   * that is genuinely a second observation.
   */
  const previousFailures = previous?.consecutive_failures ?? 0;
  const previousAt = previous?.checked_at ? Date.parse(previous.checked_at) : 0;
  const nowMs = Date.parse(at);
  const farEnoughApart =
    previousFailures === 0 ||
    !Number.isFinite(previousAt) ||
    nowMs - previousAt >= FAILURE_GAP_MS;

  const failures = farEnoughApart ? previousFailures + 1 : previousFailures;

  if (failures < FAILURES_BEFORE_UNREACHABLE) {
    /*
     * The first strike. The badge keeps whatever it said before — including
     * `conforming` — because one failed fetch is not evidence that anything
     * changed. The counter and the new timestamp are recorded so the second
     * strike knows how long ago the first was.
     */
    return {
      ...base,
      state: previous?.state ?? 'unmeasured',
      level: previous?.level ?? null,
      failing_checks: previous?.failing_checks,
      feed_age_hours: previous?.feed_age_hours,
      consecutive_failures: failures,
    };
  }

  return {
    ...base,
    state: 'unreachable',
    level: previous?.level ?? null,
    consecutive_failures: failures,
  };
}

/**
 * Should a `registry:status` issue be opened or updated for this transition?
 *
 * Only on entering a bad state, never on staying in one: an issue reopened
 * every six hours is an issue nobody reads. Recovery closes it, which is the
 * other half of the same rule — a tracker that only ever grows is not a signal.
 */
export function issueAction(previous, next) {
  if (!next) return 'none';
  const wasBad =
    previous?.state === 'failing' || previous?.state === 'unreachable';
  const isBad = next.state === 'failing' || next.state === 'unreachable';

  if (isBad && !wasBad) return 'open';
  if (isBad && wasBad) return 'update';
  if (!isBad && wasBad) return 'close';
  return 'none';
}

/** One line per publisher, for the run summary and the dry-run output. */
export function describeTransition(previous, next) {
  const from = previous?.state ?? 'unmeasured';
  const to = next?.state ?? '(unchanged)';
  return from === to ? `${to}` : `${from} → ${to}`;
}
