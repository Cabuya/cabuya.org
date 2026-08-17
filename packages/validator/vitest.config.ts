import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        // Ajv's ahead-of-time output: tens of thousands of generated
        // statements, most of them branches for schema shapes this project
        // does not use. Its correctness is asserted by the schema tests —
        // every vendored example, valid and invalid, is run through it — and
        // by `schemas:check`, which fails when it drifts from the schema it
        // was built from. Chasing branch coverage through a code generator's
        // output would be test theatre, and it would bury the number that
        // matters underneath it.
        'src/generated/**',
        // The check catalogue is data, not logic: one object literal per
        // check, consumed by the passes and rendered by the website.
        'src/checks.ts',
        'src/schemas.ts',
      ],
      reporter: ['text', 'text-summary', 'html'],
      thresholds: {
        // Higher than the website's 80. This package is the enforcement point
        // of the entire protocol — if it is wrong, every conformance claim
        // downstream of it is wrong in the same direction, and nobody finds
        // out by reading a page.
        lines: 90,
        functions: 85,
        statements: 90,
        // Branches sits lower than the rest, deliberately and with the number
        // recorded rather than rounded up. The engine's passes are dense with
        // optional-field handling — `status?.failing_checks?.length`, and
        // dozens like it — where the absent branch is a field a conforming
        // publisher simply did not send. Reaching 90 here would mean a fixture
        // per optional field permutation, which tests the fixtures rather than
        // the engine.
        branches: 80,
      },
    },
  },
});
