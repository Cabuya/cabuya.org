<script lang="ts">
/**
 * The validator, in a browser.
 *
 * Two modes, and the difference between them is not cosmetic:
 *
 * - **Paste** runs the real engine here, in the page. Nothing is uploaded. For
 *   a feed that is not deployed yet, or one somebody would rather not send to a
 *   server, that is the difference between using the tool and not.
 * - **URL** posts to the Pages Function, which can do what a browser cannot:
 *   fetch a cross-origin document and observe the transport behaviour — CORS,
 *   content type, whether the manifest path is really serving JSON. Those
 *   checks are most of what separates "my file looks right" from "consumers can
 *   actually read me".
 *
 * The engine is lazy-loaded on first run. It is the heaviest thing on the site,
 * and a reader who came to read the page should not pay for it.
 *
 * Failure states are kept honest, which is the same discipline as the CLI's
 * exit codes: a transport failure is reported as a transport failure and never
 * rendered as an empty findings list, because an empty list means "we looked
 * and found nothing wrong".
 */
import type { Report } from '@cabuya/validator';

import {
  isSuccess,
  screenUrl,
  VALIDATE_ENDPOINT,
  type ValidateResponse,
} from '@/lib/validate-api-contract';
import ReportView from './ReportView.svelte';

export let lang: 'en' | 'es' = 'en';
export let labels: Record<string, string>;
export let reportLabels: Record<string, string>;
export let checksBase = '/developers/validator/checks';
/** Flip to true when Task 27 deploys the Function. */
export let urlModeAvailable = false;
/** Prefilled from `?url=` so the quickstart can hand a URL over. */
export let initialUrl = '';

type State =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'report'; report: Report; summary: string }
  | { kind: 'error'; title: string; body: string };

let url = initialUrl;
let document_ = '';
let documentKind: 'feed' | 'manifest' = 'feed';
let state: State = { kind: 'idle' };
let copied = false;

/** Loaded once, on first run. */
let enginePromise: Promise<typeof import('@cabuya/validator')> | null = null;
function engine() {
  if (!enginePromise) enginePromise = import('@cabuya/validator');
  return enginePromise;
}

/** The schemas the core needs. Fetched, not bundled — they are data. */
let schemasPromise: Promise<Record<string, unknown>> | null = null;
function schemas() {
  if (!schemasPromise) {
    schemasPromise = Promise.all([
      fetch('/schemas/0.1/place-feed.schema.json').then((r) => r.json()),
      fetch('/schemas/0.1/manifest.schema.json').then((r) => r.json()),
    ]).then(([feed, manifest]) => ({
      'place-feed.schema.json': feed,
      'manifest.schema.json': manifest,
    }));
  }
  return schemasPromise;
}

async function runPaste(): Promise<void> {
  state = { kind: 'running' };
  copied = false;

  let parsed: unknown;
  try {
    parsed = JSON.parse(document_);
  } catch {
    state = {
      kind: 'error',
      title: labels.parseErrorTitle,
      body: labels.parseErrorBody,
    };
    return;
  }

  try {
    const [mod, loaded] = await Promise.all([engine(), schemas()]);
    const runner = new mod.Engine({
      validatorVersion: 'web',
      specVersion: mod.SPEC_VERSION,
      target: documentKind === 'manifest' ? 'manifest.json' : 'places.json',
      schemas: loaded,
      // No fetcher: degraded mode, and the report says so rather than
      // implying the transport checks passed.
    });
    runner.register(mod.schemaPass, mod.semanticPass, mod.denyPass);
    const raw = await runner.run(parsed, document_);
    const report =
      lang === 'es'
        ? {
            ...raw,
            findings: raw.findings.map((finding) =>
              mod.translateFinding(finding, 'es')
            ),
          }
        : raw;
    state = { kind: 'report', report, summary: mod.summaryPhrase(report) };
  } catch (error) {
    state = {
      kind: 'error',
      title: labels.parseErrorTitle,
      body: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runUrl(): Promise<void> {
  const screened = screenUrl(url);
  if (!screened.ok) {
    state = {
      kind: 'error',
      title: labels.transportTitle,
      body: labels.transportBody,
    };
    return;
  }

  state = { kind: 'running' };
  copied = false;

  try {
    const response = await fetch(VALIDATE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, kind: 'auto', lang }),
    });
    const payload = (await response.json()) as ValidateResponse;
    state = isSuccess(payload)
      ? {
          kind: 'report',
          report: payload.report,
          summary: (await engine()).summaryPhrase(payload.report),
        }
      : {
          kind: 'error',
          title:
            payload.kind === 'transport'
              ? labels.transportTitle
              : labels.parseErrorTitle,
          body: payload.message,
        };
  } catch {
    state = {
      kind: 'error',
      title: labels.transportTitle,
      body: labels.transportBody,
    };
  }
}

async function copyReport(): Promise<void> {
  if (state.kind !== 'report') return;
  const mod = await engine();
  try {
    await navigator.clipboard.writeText(mod.renderMarkdown(state.report));
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2200);
  } catch {
    copied = false;
  }
}
</script>

<div class="not-prose">
  <!-- URL mode -->
  <section class="rounded-cabuya-md border border-cabuya-border bg-cabuya-bg-elevated p-5">
    <h2 class="font-display text-base font-semibold">{labels.urlModeTitle}</h2>
    <p class="mt-1 text-sm text-cabuya-text-secondary">{labels.urlModeLead}</p>

    {#if urlModeAvailable}
      <form class="mt-4 flex flex-col gap-3 sm:flex-row" on:submit|preventDefault={runUrl}>
        <label class="sr-only" for="validator-url">{labels.urlLabel}</label>
        <input
          id="validator-url"
          type="url"
          bind:value={url}
          placeholder={labels.urlPlaceholder}
          class="flex-1 rounded-cabuya-sm border border-cabuya-border-interactive bg-cabuya-bg px-3 py-2 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-cabuya-primary"
        />
        <button
          type="submit"
          disabled={state.kind === 'running'}
          class="rounded-cabuya-sm bg-cabuya-fill px-5 py-2 text-sm font-semibold text-cabuya-on-fill hover:bg-cabuya-fill-strong disabled:opacity-60"
        >
          {state.kind === 'running' ? labels.running : labels.run}
        </button>
      </form>
    {:else}
      <div class="mt-4 rounded-cabuya-sm border border-cabuya-warning/40 bg-cabuya-warning-soft p-4">
        <p class="text-sm font-semibold text-cabuya-warning">
          {labels.unavailableTitle}
        </p>
        <p class="mt-1 text-sm text-cabuya-text-secondary">
          {labels.unavailableBody}
        </p>
      </div>
    {/if}
  </section>

  <!-- Paste mode -->
  <section class="mt-6 rounded-cabuya-md border border-cabuya-border bg-cabuya-bg-elevated p-5">
    <h2 class="font-display text-base font-semibold">{labels.pasteModeTitle}</h2>
    <p class="mt-1 text-sm text-cabuya-text-secondary">{labels.pasteModeLead}</p>
    <p class="mt-2 text-sm text-cabuya-success">{labels.pastePrivacy}</p>

    <form class="mt-4 flex flex-col gap-3" on:submit|preventDefault={runPaste}>
      <fieldset class="flex flex-wrap items-center gap-4">
        <legend class="text-xs font-semibold uppercase tracking-wider text-cabuya-text-muted">
          {labels.kindLabel}
        </legend>
        <label class="flex items-center gap-2 text-sm">
          <input type="radio" bind:group={documentKind} value="feed" />
          {labels.kindFeed}
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="radio" bind:group={documentKind} value="manifest" />
          {labels.kindManifest}
        </label>
      </fieldset>

      <label class="sr-only" for="validator-document">{labels.pasteLabel}</label>
      <textarea
        id="validator-document"
        bind:value={document_}
        rows="10"
        spellcheck="false"
        placeholder={labels.pastePlaceholder}
        class="w-full rounded-cabuya-sm border border-cabuya-border-interactive bg-cabuya-bg px-3 py-2 font-mono text-xs focus:outline-2 focus:outline-offset-1 focus:outline-cabuya-primary"
      ></textarea>

      <div>
        <button
          type="submit"
          disabled={state.kind === 'running' || document_.trim().length === 0}
          class="rounded-cabuya-sm bg-cabuya-fill px-5 py-2 text-sm font-semibold text-cabuya-on-fill hover:bg-cabuya-fill-strong disabled:opacity-60"
        >
          {state.kind === 'running' ? labels.running : labels.run}
        </button>
      </div>
    </form>
  </section>

  {#if state.kind === 'error'}
    <div
      class="mt-6 rounded-cabuya-md border border-cabuya-danger/40 bg-cabuya-danger-soft p-5"
      aria-live="polite"
    >
      <p class="font-semibold text-cabuya-danger">{state.title}</p>
      <p class="mt-1 text-sm text-cabuya-text-secondary">{state.body}</p>
    </div>
  {/if}

  {#if state.kind === 'report'}
    <ReportView
      report={state.report}
      summary={state.summary}
      labels={reportLabels}
      {checksBase}
    />
    <button
      type="button"
      class="mt-4 rounded-cabuya-sm border border-cabuya-border-interactive px-4 py-2 text-sm font-medium text-cabuya-primary hover:bg-cabuya-primary-soft"
      on:click={copyReport}
    >
      {copied ? labels.copied : labels.copyReport}
    </button>
  {/if}
</div>
