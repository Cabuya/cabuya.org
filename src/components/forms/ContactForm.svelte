<script lang="ts">
/**
 * The one form on the site.
 *
 * `client:visible`, because a form below the fold on a contribution page is
 * not worth a byte until somebody scrolls to it.
 *
 * ## Where the rules live
 *
 * Not here. `validateContact` is imported from the shared contract and is the
 * same function the Pages Function runs, so this form cannot reject something
 * the server would accept or accept something it will reject. The only thing
 * this file decides is *when* to show a message — on blur after a first
 * attempt, never while somebody is still typing their first word.
 *
 * ## What it says about what happens
 *
 * The privacy sentence is above the fields, not under the button. Somebody
 * deciding whether to type something sensitive needs that before they type
 * it, not after they have finished and are looking for the submit.
 *
 * There is no "we will reply within X". The 48-hour target the project states
 * publicly is about issues, and repeating it here would extend a promise
 * nobody made about email.
 */
import {
  CONTACT_ENDPOINT,
  CONTACT_INTERESTS,
  CONTACT_LIMITS,
  type ContactInterest,
  type ContactResponse,
  validateContact,
} from '@/lib/contact-contract';

interface Labels {
  privacy: string;
  nameLabel: string;
  nameOptional: string;
  organizationLabel: string;
  organizationOptional: string;
  emailLabel: string;
  emailHint: string;
  messageLabel: string;
  messageHint: string;
  interestLabel: string;
  interestOptions: Record<string, string>;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  errors: Record<string, string>;
  rateLimitedTitle: string;
  rateLimitedBody: string;
  upstreamTitle: string;
  upstreamBody: string;
  notConfiguredTitle: string;
  notConfiguredBody: string;
}

export let labels: Labels;
export let lang: 'en' | 'es' = 'en';

let name = '';
let organization = '';
let email = '';
let message = '';
let interest: ContactInterest = 'implement';
/** The honeypot. Never focusable, never announced, never visible. */
let website = '';

/** When this form appeared, for the elapsed-time check the server applies. */
const renderedAt = Date.now();

let attempted = false;
let sending = false;
let outcome: 'idle' | 'sent' | 'rate-limited' | 'upstream' | 'not-configured' =
  'idle';

$: failures = attempted
  ? validateContact({ name, organization, email, message, interest })
  : [];

/*
 * The messages are derived *data*, not a function the template calls.
 *
 * `{#if errorFor('email')}` looks equivalent and is not: Svelte re-runs a
 * template expression when its arguments or the function reference change, and
 * neither does here — so the block would be evaluated once, with `failures`
 * empty, and never again. The form validated correctly and displayed nothing,
 * which is the worst of the three possible outcomes. Found by submitting an
 * empty form in a browser; no type or test would have caught it.
 */
$: errors = Object.fromEntries(
  failures.map((failure) => [
    failure.field,
    labels.errors[`${failure.field}-${failure.reason}`] ?? null,
  ])
) as Partial<Record<string, string | null>>;

async function submit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  attempted = true;
  outcome = 'idle';

  if (
    validateContact({ name, organization, email, message, interest }).length
  ) {
    return;
  }

  sending = true;
  try {
    const response = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        organization,
        email,
        message,
        interest,
        lang,
        website,
        elapsedMs: Date.now() - renderedAt,
      }),
    });

    const body = (await response
      .json()
      .catch(() => null)) as ContactResponse | null;

    if (body?.ok) {
      outcome = 'sent';
      // Cleared only on success. A failed send must leave the text in the
      // box — somebody who just wrote four paragraphs should not have to
      // write them again because our upstream was down.
      name = '';
      organization = '';
      email = '';
      message = '';
      attempted = false;
      return;
    }

    outcome =
      body && !body.ok && body.kind === 'rate-limited'
        ? 'rate-limited'
        : body && !body.ok && body.kind === 'not-configured'
          ? 'not-configured'
          : 'upstream';
  } catch {
    outcome = 'upstream';
  } finally {
    sending = false;
  }
}

const FIELD =
  'w-full rounded-cabuya-sm border border-cabuya-border bg-cabuya-bg px-3 py-2 text-cabuya-text focus:border-cabuya-border-interactive focus:outline-none focus-visible:ring-2 focus-visible:ring-cabuya-primary';
const LABEL = 'block text-sm font-semibold text-cabuya-text';
const HINT = 'mt-1 block text-xs text-cabuya-text-muted';
const ERROR = 'mt-1 block text-xs font-semibold text-cabuya-danger';
</script>

<form class="not-prose flex max-w-2xl flex-col gap-5" on:submit={submit} novalidate>
  <p
    class="rounded-cabuya-md border border-cabuya-border bg-cabuya-bg-elevated p-4 text-sm text-cabuya-text-secondary"
  >
    {labels.privacy}
  </p>

  <div class="grid gap-5 sm:grid-cols-2">
    <div>
      <label class={LABEL} for="contact-name">
        {labels.nameLabel}
        <span class="font-normal text-cabuya-text-muted">
          ({labels.nameOptional})
        </span>
      </label>
      <input
        id="contact-name"
        class={`${FIELD} mt-1`}
        type="text"
        bind:value={name}
        maxlength={CONTACT_LIMITS.nameMax}
        autocomplete="name"
      />
      {#if errors.name}
        <span class={ERROR}>{errors.name}</span>
      {/if}
    </div>

    <div>
      <label class={LABEL} for="contact-organization">
        {labels.organizationLabel}
      </label>
      <input
        id="contact-organization"
        class={`${FIELD} mt-1`}
        type="text"
        bind:value={organization}
        maxlength={CONTACT_LIMITS.organizationMax}
        autocomplete="organization"
        aria-describedby="contact-organization-hint"
      />
      <span class={HINT} id="contact-organization-hint">
        {labels.organizationOptional}
      </span>
      {#if errors.organization}
        <span class={ERROR}>{errors.organization}</span>
      {/if}
    </div>
  </div>

  <div>
    <label class={LABEL} for="contact-email">{labels.emailLabel}</label>
    <input
      id="contact-email"
      class={`${FIELD} mt-1`}
      type="email"
      bind:value={email}
      maxlength={CONTACT_LIMITS.emailMax}
      autocomplete="email"
      required
      aria-describedby="contact-email-hint"
      aria-invalid={errors.email ? 'true' : undefined}
    />
    <span class={HINT} id="contact-email-hint">{labels.emailHint}</span>
    {#if errors.email}
      <span class={ERROR}>{errors.email}</span>
    {/if}
  </div>

  <div>
    <label class={LABEL} for="contact-interest">{labels.interestLabel}</label>
    <select
      id="contact-interest"
      class={`${FIELD} mt-1`}
      bind:value={interest}
    >
      {#each CONTACT_INTERESTS as option (option)}
        <option value={option}>{labels.interestOptions[option]}</option>
      {/each}
    </select>
  </div>

  <div>
    <label class={LABEL} for="contact-message">{labels.messageLabel}</label>
    <textarea
      id="contact-message"
      class={`${FIELD} mt-1 min-h-[10rem]`}
      bind:value={message}
      maxlength={CONTACT_LIMITS.messageMax}
      required
      aria-describedby="contact-message-hint"
      aria-invalid={errors.message ? 'true' : undefined}
    ></textarea>
    <span class={HINT} id="contact-message-hint">{labels.messageHint}</span>
    {#if errors.message}
      <span class={ERROR}>{errors.message}</span>
    {/if}
  </div>

  <!--
    The honeypot. `aria-hidden` and `tabindex="-1"` keep it away from screen
    readers and the keyboard; `hidden` keeps it off the screen. A bot filling
    every input finds it; a person never encounters it in any modality.
  -->
  <div hidden aria-hidden="true">
    <label for="contact-website">Website</label>
    <input
      id="contact-website"
      name="website"
      type="text"
      tabindex="-1"
      autocomplete="off"
      bind:value={website}
    />
  </div>

  <div>
    <button
      type="submit"
      class="inline-flex items-center rounded-cabuya-md bg-cabuya-fill px-5 py-3 font-semibold text-cabuya-on-fill hover:bg-cabuya-fill-strong disabled:opacity-70"
      disabled={sending}
    >
      {sending ? labels.submitting : labels.submit}
    </button>
  </div>

  <!--
    One live region for every outcome. Two would mean a screen reader hearing
    the old state and the new one, in whichever order the DOM happened to
    update them.
  -->
  <div aria-live="polite" class="empty:hidden">
    {#if outcome === 'sent'}
      <div
        class="rounded-cabuya-md border border-cabuya-success bg-cabuya-success-soft p-4"
      >
        <p class="font-semibold text-cabuya-success">{labels.successTitle}</p>
        <p class="mt-1 text-sm text-cabuya-text-secondary">
          {labels.successBody}
        </p>
      </div>
    {:else if outcome === 'rate-limited'}
      <div
        class="rounded-cabuya-md border border-cabuya-warning bg-cabuya-warning-soft p-4"
      >
        <p class="font-semibold text-cabuya-warning">
          {labels.rateLimitedTitle}
        </p>
        <p class="mt-1 text-sm text-cabuya-text-secondary">
          {labels.rateLimitedBody}
        </p>
      </div>
    {:else if outcome === 'not-configured'}
      <div
        class="rounded-cabuya-md border border-cabuya-border-strong bg-cabuya-bg-brand p-4"
      >
        <p class="font-semibold text-cabuya-text">
          {labels.notConfiguredTitle}
        </p>
        <p class="mt-1 text-sm text-cabuya-text-secondary">
          {labels.notConfiguredBody}
        </p>
      </div>
    {:else if outcome === 'upstream'}
      <div
        class="rounded-cabuya-md border border-cabuya-danger bg-cabuya-danger-soft p-4"
      >
        <p class="font-semibold text-cabuya-danger">{labels.upstreamTitle}</p>
        <p class="mt-1 text-sm text-cabuya-text-secondary">
          {labels.upstreamBody}
        </p>
      </div>
    {/if}
  </div>
</form>
