<script lang="ts">
/**
 * The sidebar, on a phone.
 *
 * The only interactive part of the portal chrome. It receives the rendered
 * sidebar markup as a slot rather than re-implementing the list in Svelte —
 * one source of truth for the navigation, and no second place for the active
 * state to be computed differently.
 *
 * Same keyboard contract as the site header: Escape closes and returns focus,
 * Tab is trapped while open.
 */
export let labels: { open: string; close: string };

let open = false;
let panel: HTMLElement | undefined;
let toggle: HTMLButtonElement | undefined;

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || !open) return;
  open = false;
  toggle?.focus();
}

function trapFocus(event: KeyboardEvent): void {
  if (!open || event.key !== 'Tab' || !panel) return;
  const focusable = panel.querySelectorAll<HTMLElement>('a[href], button');
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
</script>

<svelte:window on:keydown={onKeydown} />

<div class="lg:hidden">
  <button
    bind:this={toggle}
    type="button"
    class="inline-flex w-full items-center justify-between rounded-cabuya-sm border border-cabuya-border px-4 py-2.5 text-sm font-medium text-cabuya-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cabuya-primary"
    aria-expanded={open}
    aria-controls="docs-mobile-nav"
    on:click={() => (open = !open)}
  >
    <span>{open ? labels.close : labels.open}</span>
    <svg
      class="h-4 w-4 transition-transform"
      class:rotate-180={open}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      aria-hidden="true"
    >
      <path d="M4 6l4 4 4-4" stroke-linecap="round" />
    </svg>
  </button>

  {#if open}
    <div
      id="docs-mobile-nav"
      bind:this={panel}
      class="mt-2 rounded-cabuya-sm border border-cabuya-border bg-cabuya-bg-elevated p-4"
      on:keydown={trapFocus}
      role="dialog"
      aria-modal="false"
      tabindex="-1"
      aria-label={labels.open}
    >
      <slot />
    </div>
  {/if}
</div>
