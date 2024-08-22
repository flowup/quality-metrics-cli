/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { tsconfigPathAliases } from '../../tools/vitest-tsconfig-path-aliases';

export default defineConfig({
  cacheDir: `../../node_modules/.vite/${process.env['NX_TASK_TARGET_PROJECT']}`,
  test: {
    reporters: ['basic'],
    testTimeout: 140_000,
    globals: true,
    alias: tsconfigPathAliases(),
    pool: 'threads',
    poolOptions: { threads: { singleThread: true } },
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'node',
    include: ['tests/**/*.e2e.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    globalSetup: ['../../global-setup.verdaccio.ts'],
    setupFiles: [
      '../../testing/test-setup/src/lib/reset.mocks.ts',
      '../../testing/test-setup/src/lib/e2e.setup-flies.ts',
    ],
  },
});
