<script>
import { EVENTS, trackEvent } from '@/lib/analytics';
import { getUrlPrefix } from '@/lib/i18n';
import { getTranslations } from '@/lib/translations';

export let currentTag;
export let tagsResult;
export let topicTags = [];
export let subtopicTags = [];
export let subtopicAccentByName = {};
export let totalPosts = 0;
export let currentPagePosts = 0;
export let currentPage = 1;
export let totalPages = 1;
export let lang = 'es';

$: t = getTranslations(lang);
$: basePrefix = getUrlPrefix(lang);

// Check if currentTag is a topic (secondary) tag
$: isTopicActive = topicTags.includes(currentTag);

// Secondary-only list (excludes subtopics for the dedicated subtopic row).
$: secondaryOnly = topicTags.filter((t) => !subtopicTags.includes(t));

// Translations for header content
$: headerTitle = currentTag
  ? t.postsTagged(t.tagNames[currentTag] || currentTag)
  : t.blogHeading;
$: headerSubtitle = currentTag
  ? t.tagDescriptions[currentTag] || t.blogDescription
  : t.blogDescription;
$: showingText = t.showingArticles(currentPagePosts, totalPosts);
$: availableText = t.articlesAvailable(totalPosts);
</script>

<h1 class="mb-2 text-3xl font-extrabold text-cabuya sm:text-4xl md:text-5xl">
  {headerTitle}
</h1>
<p class="mb-5 max-w-3xl text-base text-cabuya-secondary sm:text-lg">
  {headerSubtitle}
</p>

<!-- Post counter -->
<div class="mb-4 text-cabuya-secondary">
  {#if totalPages > 1}
    <p class="text-sm">
      {showingText}
      <span class="text-cabuya-secondary">({t.pageOf(currentPage, totalPages)})</span>
    </p>
  {:else}
    <p class="text-sm">
      {availableText}
    </p>
  {/if}
</div>

<!-- Primary tag pills -->
<div class="mb-4 flex flex-wrap gap-2">
  <!-- Link to all articles -->
  <a
    href={`${basePrefix}/blog/`}
    class={`inline-flex items-center rounded px-3 py-1 text-xs font-semibold transition-colors ${
      !currentTag
        ? "bg-cabuya-fill text-cabuya-on-fill shadow-sm"
        : "bg-cabuya-primary-soft text-cabuya-primary hover:bg-cabuya-primary/15"
    }`}
  >
    {t.allPosts}
  </a>

  <!-- Primary tags -->
  {#each tagsResult as tag}
    <a
      href={`${basePrefix}/blog/tag/${tag}/`}
      class={`inline-flex items-center rounded px-3 py-1 text-xs font-semibold transition-colors ${
        currentTag === tag
          ? "bg-cabuya-fill text-cabuya-on-fill shadow-sm"
          : "bg-cabuya-primary-soft text-cabuya-primary hover:bg-cabuya-primary/15"
      }`}
      on:click={() => trackEvent(EVENTS.TAG_FILTER, { tag })}
    >
      #{t.tagNames[tag] || tag}
    </a>
  {/each}
</div>

<!-- Topic tag pills (secondary tier) -->
{#if secondaryOnly.length > 0}
  <div class="mb-3 flex flex-wrap gap-1.5">
    {#each secondaryOnly as topic}
      <a
        href={`${basePrefix}/blog/tag/${topic}/`}
        class={`rounded px-2.5 py-0.5 text-xs transition-colors ${
          currentTag === topic
            ? "border border-cabuya-text bg-cabuya-text text-cabuya-bg"
            : "border border-cabuya-border bg-cabuya-bg-elevated text-cabuya-secondary hover:border-cabuya-border-strong hover:text-cabuya"
        }`}
        on:click={() => trackEvent(EVENTS.TAG_FILTER, { tag: topic })}
      >
        {t.tagNames[topic] || topic}
      </a>
    {/each}
  </div>
{/if}

<!-- Subtopic tag pills (tier 3) — code-identifier style: monospace + faint fill + parent-domain chevron. -->
{#if subtopicTags && subtopicTags.length > 0}
  <div class="mb-10 flex flex-wrap gap-1.5">
    {#each subtopicTags as sub}
      <a
        href={`${basePrefix}/blog/tag/${sub}/`}
        class={`inline-flex items-center rounded px-2 py-0.5 text-xs transition-colors ${
          currentTag === sub
            ? "border border-cabuya-text bg-cabuya-text text-cabuya-bg"
            : "bg-cabuya-bg-elevated text-cabuya-secondary border border-dashed border-cabuya-border hover:bg-cabuya-primary-soft hover:border-cabuya-border-strong hover:text-cabuya"
        }`}
        on:click={() => trackEvent(EVENTS.TAG_FILTER, { tag: sub })}
      >
        <span class={`mr-1 ${currentTag === sub ? 'opacity-70' : (subtopicAccentByName[sub] || 'text-cabuya-secondary')}`} aria-hidden="true">›</span>{t.tagNames[sub] || sub}
      </a>
    {/each}
  </div>
{/if}
