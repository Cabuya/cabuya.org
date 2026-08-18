module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      /*
       * The eight representative routes: one per page *renderer*, not one per
       * page — a regression lives in a renderer, so covering each once
       * catches everything. Both languages are here because they are
       * different documents, natively written, and Spanish prose is reliably
       * longer — where a layout shift shows first. CI samples two of these
       * (`lighthouserc.cjs`); this is the full set, for local runs and
       * release checks.
       */
      url: [
        '/',
        '/es/',
        '/developers/quickstart/',
        '/developers/spec/0.1/3-the-feed/',
        '/developers/schemas/0.1/place-feed/',
        '/developers/validator/',
        '/registry/',
        '/registry/corag/',
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
