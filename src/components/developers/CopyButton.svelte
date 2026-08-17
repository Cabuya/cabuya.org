<script lang="ts">
/**
 * Copy-to-clipboard, as small as this can honestly be.
 *
 * The confirmation is a text swap, not only an icon change: a screen-reader
 * user gets `aria-live` announcing "Copied", and a colour-blind user reads the
 * word rather than inferring it from a green tick.
 *
 * Failure is reported. `navigator.clipboard` rejects in a non-secure context
 * and when permission is denied, and a button that silently does nothing is
 * worse than one that says it could not — the reader still has the code, and
 * can select it by hand.
 */
export let text: string;
export let labels: { copy: string; copied: string; failed: string } = {
  copy: 'Copy',
  copied: 'Copied',
  failed: 'Press ⌘C',
};

type State = 'idle' | 'copied' | 'failed';
let state: State = 'idle';
let timer: ReturnType<typeof setTimeout> | undefined;

async function copy(): Promise<void> {
  clearTimeout(timer);
  try {
    await navigator.clipboard.writeText(text);
    state = 'copied';
  } catch {
    state = 'failed';
  }
  timer = setTimeout(() => {
    state = 'idle';
  }, 2200);
}

$: label =
  state === 'copied'
    ? labels.copied
    : state === 'failed'
      ? labels.failed
      : labels.copy;
</script>

<button
  type="button"
  class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-cabuya-on-fill/80 transition-colors hover:text-cabuya-on-fill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cabuya-primary-light"
  on:click={copy}
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

<span class="sr-only" aria-live="polite">
  {state === 'idle' ? '' : label}
</span>
