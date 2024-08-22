// eslint-disable-next-line n/no-sync
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { setupTestFolder, teardownTestFolder } from '@code-pushup/test-setup';
import { objectToCliArgs } from '@code-pushup/utils';
import { nxRunManyNpmUninstall } from '../../../tools/src/npm/utils';
import startLocalRegistry from '../../../tools/src/verdaccio/start-local-registry';
import stopLocalRegistry from '../../../tools/src/verdaccio/stop-local-registry';
import { RegistryResult } from '../../../tools/src/verdaccio/types';
import { configureRegistry } from '../../../tools/src/verdaccio/utils';

const e2eDir = join('tmp', 'e2e');
let activeRegistry: RegistryResult | undefined;
export async function setup() {
  await setupTestFolder('tmp/local-registry');
  await setupTestFolder(e2eDir);

  let port: string | number;
  // eslint-disable-next-line n/no-sync
  try {
    const registryResult = await startLocalRegistry({
      projectName: 'pkg1-e2e',
    });
    configureRegistry(registryResult.registryData);
    activeRegistry = registryResult;
    port = activeRegistry.registryData.port;
  } catch (error) {
    console.error(
      `Error starting pkg1-e2e verdaccio registry:\n${
        (error as Error).message
      }`,
    );
    throw error;
  }
  // eslint-disable-next-line n/no-sync
  execFileSync(
    'npx',
    objectToCliArgs({
      _: ['nx', 'install-deps', 'cli-e2e', '--', `--port=${port}`],
    }),
    { env: process.env, stdio: 'inherit', shell: true },
  );
}

export async function teardown() {
  if (activeRegistry && 'registryData' in activeRegistry) {
    const { stop } = activeRegistry;

    stopLocalRegistry(stop);
    nxRunManyNpmUninstall();
  } else {
    throw new Error(`Failed to stop registry.`);
  }
  await teardownTestFolder(e2eDir);
}
