/// <reference types="vitest" />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/plugin-coverage',
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    alias: [
      {
        find: '@code-pushup/models',
        replacement: new URL('../models/src', import.meta.url).pathname,
      },
      {
        find: '@code-pushup/utils',
        replacement: new URL('../utils/src', import.meta.url).pathname,
      },
    ],
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    coverage: {
      reporter: ['lcov'],
    },
    environment: 'node',
    include: ['src/**/*.unit.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    globalSetup: ['../../global-setup.ts'],
    setupFiles: [
      '../../testing/test-setup/src/lib/fs.mock.ts',
      '../../testing/test-setup/src/lib/console.mock.ts',
      '../../testing/test-setup/src/lib/reset.mocks.ts',
    ],
  },
});
