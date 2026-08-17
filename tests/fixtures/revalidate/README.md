# Revalidation fixtures

Stand-ins for one validator run each, keyed by `publisher_id`. `node
scripts/revalidate.mjs --dry-run --fixtures tests/fixtures/revalidate` drives
the whole cron from these instead of from the network, which is how the state
machine is exercised end to end without touching a publisher's server.

Each file is the shape `runValidator` returns: `{ code, report }`, where `code`
is the CLI exit code (0 pass · 1 errors · 3 transport · 5 our bug) and `report`
is the `--format json` document, or `null` when the run produced none.

These are not real measurements and must never be presented as any. They exist
so the transitions can be tested, including the two-strike rule that keeps a
single failed fetch off a public badge.
