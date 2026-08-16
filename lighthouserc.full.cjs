module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: [
        // Base pages (same as lighthouserc.cjs) — pin home lang (see lighthouserc.cjs).
        '/?lang=es',
        '/about/',
        '/blog/',
        '/en/',
        // Blog listing EN (i18n parity)
        '/en/blog/',
        // Series pages
        '/blog/series/',
        // Blog tag listing
        '/blog/tag/donations/',
        // A blog post — the heaviest page type, with a responsive hero
        '/blog/how-to-tell-if-a-foundation-is-trustworthy/',
        // Form page
        '/contact/',
        // The institutional pages: one renderer, so one is representative,
        // but /emergencies carries the callout and /developers the code blocks.
        '/how-it-works/',
        '/transparency/',
        '/emergencies/',
        '/developers/',
        // Directory pages
        '/contributors/',
        '/channels/',
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags:
          '--no-sandbox --headless --lang=es-ES --user-agent="Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse"',
        blockedUrlPatterns: ['*/api/umami/*', '*umami.is*', '*umami/script.js*'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1.0 }],
        'categories:best-practices': ['error', { minScore: 1.0 }],
        'categories:seo': ['error', { minScore: 1.0 }],
        'image-aspect-ratio': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
