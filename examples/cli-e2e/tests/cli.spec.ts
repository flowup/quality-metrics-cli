import { describe, it, expect, beforeAll } from 'vitest';
import { cli } from '@quality-metrics/cli';
import { execSync } from 'child_process';

describe('cli', () => {
  beforeAll(() => {
    // symlink NPM workspaces
    execSync('npm install');
  });

  it('should load .js config file', async () => {
    cli([
      'help',
      '--configPath=/examples/cli-e2e/mocks/config.mock.js',
      '--verbose',
    ]).argv;
    await expect(
      cli(['--configPath=/examples/cli-e2e/mocks/config.mock.js']).argv,
    ).resolves.toEqual({
      plugins: [
        { name: 'eslint', version: '8.46.0' },
        { name: 'lighthouse', defaultConfig: expect.any(Object) },
      ],
    });
  });

  it('should load .mjs config file', async () => {
    await expect(
      cli(['--configPath=/examples/cli-e2e/mocks/config.mock.mjs', '--verbose'])
        .argv,
    ).resolves.toEqual({
      plugins: [
        { name: 'eslint', version: '8.46.0' },
        { name: 'lighthouse', defaultConfig: expect.any(Object) },
      ],
    });
  });

  it('should load .ts config file', async () => {
    await expect(
      cli(['--configPath=/examples/cli-e2e/mocks/config.mock.ts', '--verbose'])
        .argv,
    ).resolves.toEqual({
      plugins: [
        { name: 'eslint', version: '8.46.0' },
        { name: 'lighthouse', defaultConfig: expect.any(Object) },
      ],
    });
  });
});
