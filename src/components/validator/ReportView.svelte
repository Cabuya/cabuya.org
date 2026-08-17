<script lang="ts">
/**
 * A validation report, rendered.
 *
 * Grouped blockers-first, following the report's own
 * `blockers_for_next_level`: the reader's next action is the two findings that
 * stand between them and the next level, not the twelve warnings underneath.
 *
 * Severity is always a word. `docs/ACCESSIBILITY.md` makes that a
 * site-specific rule for exactly this surface — a report whose meaning is
 * carried by red and amber is a report a colour-blind reader has to guess at,
 * and this one is telling them whether their work is finished.
 */
/*
 * Type-only. A value import here — `summaryPhrase`, say — pulls the whole
 * validator package into this component's chunk and defeats the lazy load in
 * `ValidatorApp`: the engine ends up in the initial bundle of a page most
 * readers will never run it on. The phrase is computed by the caller, which
 * already has the engine loaded by the time it has a report.
 */
import type { Finding, Report } from '@cabuya/validator';

export let report: Report;
export let labels: {
  result: string;
  blockers: string;
  errors: string;
  warnings: string;
  notes: string;
  none: string;
  fix: string;
  rule: string;
  spec: string;
  check: string;
  degraded: string;
};
/** Computed by the caller with the engine's own `summaryPhrase`. */
export let summary = '';
export let checksBase = '/developers/validator/checks';

$: blocking = new Set(report.blockers_for_next_level ?? []);
$: blockers = report.findings.filter(
  (finding) => finding.severity === 'error' && blocking.has(finding.id)
);
$: otherErrors = report.findings.filter(
  (finding) => finding.severity === 'error' && !blocking.has(finding.id)
);
$: warnings = report.findings.filter((f) => f.severity === 'warning');
$: infos = report.findings.filter((f) => f.severity === 'info');

const TONE: Record<string, string> = {
  error: 'text-cabuya-danger',
  warning: 'text-cabuya-warning',
  info: 'text-cabuya-info',
};

const groups = (): Array<{
  title: string;
  findings: Finding[];
  key: string;
}> => [
  { key: 'blockers', title: labels.blockers, findings: blockers },
  { key: 'errors', title: labels.errors, findings: otherErrors },
  { key: 'warnings', title: labels.warnings, findings: warnings },
  { key: 'notes', title: labels.notes, findings: infos },
];
</script>

<section aria-live="polite" class="mt-8">
  <h3 class="font-display text-lg font-bold">{labels.result}</h3>

  <!-- The same sentence the CLI prints, from the same function. -->
  <p class="mt-2 text-sm font-medium">{summary}</p>

  {#if report.degraded}
    <p class="mt-2 rounded-cabuya-sm border border-cabuya-warning/40 bg-cabuya-warning-soft px-4 py-3 text-sm text-cabuya-text-secondary">
      {labels.degraded}
    </p>
  {/if}

  {#if report.findings.length === 0}
    <p class="mt-4 text-sm text-cabuya-text-secondary">{labels.none}</p>
  {/if}

  {#each groups() as group (group.key)}
    {#if group.findings.length > 0}
      <div class="mt-6">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-cabuya-text-muted">
          {group.title} ({group.findings.length})
        </h4>
        <ul class="mt-2 flex flex-col gap-3">
          <!--
            Keyed by position as well as identity. One check can fire more than
            once at the same pointer — two records missing the same required
            field both report at the envelope — and a key of id+pointer alone
            collides, which Svelte reports as `each_key_duplicate` and which
            drops findings from the list a publisher is trying to fix.
          -->
          {#each group.findings as finding, index (finding.id + finding.pointer + index)}
            <li class="rounded-cabuya-sm border border-cabuya-border bg-cabuya-bg-elevated p-4">
              <p class="flex flex-wrap items-center gap-2 text-xs">
                <!-- The severity word, never the colour alone. -->
                <span class="font-bold uppercase {TONE[finding.severity]}">
                  {finding.severity}
                </span>
                <a
                  href="{checksBase}#{finding.id}"
                  class="font-mono font-semibold text-cabuya-primary underline underline-offset-2"
                >
                  {finding.id}
                </a>
                {#if finding.pointer}
                  <code class="text-cabuya-text-muted">{finding.pointer}</code>
                {/if}
              </p>
              <p class="mt-2 text-sm">{finding.message}</p>
              <p class="mt-2 text-sm text-cabuya-text-secondary">
                <span class="font-semibold">{labels.fix}:</span> {finding.fix}
              </p>
              <details class="mt-2">
                <summary class="cursor-pointer text-xs text-cabuya-text-muted">
                  {labels.check}
                </summary>
                <p class="mt-2 text-xs text-cabuya-text-secondary">
                  <span class="font-semibold">{labels.rule}:</span> {finding.rule}
                </p>
                {#if finding.spec}
                  <p class="mt-1 text-xs">
                    <a
                      href={finding.spec}
                      class="text-cabuya-primary underline underline-offset-2"
                    >
                      {labels.spec}
                    </a>
                  </p>
                {/if}
              </details>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  {/each}
</section>
