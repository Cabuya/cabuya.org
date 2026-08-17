<script lang="ts">
/**
 * "Copy this page as Markdown", for the reader who is an agent — or who is
 * about to paste the page into one.
 *
 * Every page on this site serves a complete Markdown twin at `{route}.md`, and
 * this fetches that rather than scraping the DOM. Scraping would give the agent
 * the navigation chrome, the theme toggle and the cookie-free analytics note
 * along with the content; the twin is the content, written for exactly this.
 *
 * The link beside the button is the more important half: it works with
 * JavaScript disabled, it can be shared, and an agent that can fetch a URL does
 * not need a clipboard at all.
 */
export let twinUrl: string;
export let labels: {
  copy: string;
  copied: string;
  failed: string;
  view: string;
};

type State = 'idle' | 'busy' | 'copied' | 'failed';
let state: State = 'idle';
let timer: ReturnType<typeof setTimeout> | undefined;

async function copyMarkdown(): Promise<void> {
  clearTimeout(timer);
  state = 'busy';
  try {
    const response = await fetch(twinUrl);
    if (!response.ok) throw new Error(String(response.status));
    await navigator.clipboard.writeText(await response.text());
    state = 'copied';
  } catch {
    state = 'failed';
  }
  timer = setTimeout(() => {
    state = 'idle';
  }, 2400);
}

$: label =
  state === 'copied'
    ? labels.copied
    : state === 'failed'
      ? labels.failed
      : labels.copy;
</script>

<div class="flex flex-wrap items-center gap-3 text-xs">
  <button
    type="button"
    class="inline-flex items-center gap-1.5 rounded-md border border-cabuya-border px-2.5 py-1 font-medium text-cabuya-text-secondary transition-colors hover:border-cabuya-primary hover:text-cabuya-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cabuya-primary disabled:opacity-60"
    disabled={state === 'busy'}
    on:click={copyMarkdown}
  >
    <svg
      class="h-3.5 w-3.5"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      aria-hidden="true"
    >
      {#if state === 'copied'}
        <path d="M3 8.5l3.5 3.5L13 5" stroke-linecap="round" stroke-linejoin="round" />
      {:else}
        <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
        <path d="M10.5 3.5H3.5a1 1 0 0 0-1 1v7" stroke-linecap="round" />
      {/if}
    </svg>
    <span>{label}</span>
  </button>

  <a
    href={twinUrl}
    class="text-cabuya-text-muted underline underline-offset-2 hover:text-cabuya-primary"
  >
    {labels.view}
  </a>
</div>

<span class="sr-only" aria-live="polite">{state === 'idle' ? '' : label}</span>
