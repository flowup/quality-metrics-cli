import { join } from 'node:path';
import { setup as globalSetup } from './global-setup';
import { setupTestFolder, teardownTestFolder } from './testing/test-setup/src';
import {
  nxRunManyNpmInstall,
  nxRunManyNpmUninstall,
} from './tools/src/npm/utils';
import { findLatestVersion, nxRunManyPublish } from './tools/src/publish/utils';
import startLocalRegistry from './tools/src/verdaccio/start-local-registry';
import stopLocalRegistry from './tools/src/verdaccio/stop-local-registry';
import { RegistryResult } from './tools/src/verdaccio/types';

// @TODO move this into project targets
const uniquePort: number = Number(
  (6000 + Number(Math.random() * 1000)).toFixed(0),
);
const e2eDir = join('tmp', 'e2e');
const uniqueDir = join(e2eDir, `registry-${uniquePort}`);

let activeRegistry: RegistryResult;

export async function setup() {
  await globalSetup();
  await setupTestFolder('tmp/local-registry');
  await setupTestFolder(e2eDir);

  try {
    activeRegistry = await startLocalRegistry({
      localRegistryTarget: '@code-pushup/cli-source:start-verdaccio',
      storage: join(uniqueDir, 'storage'),
      port: uniquePort,
    });
  } catch (error) {
    console.error('Error starting local verdaccio registry:\n' + error.message);
    throw error;
  }

  // package publish
  try {
    console.info('Publish packages');
    const { registry } = activeRegistry.registryData;
    nxRunManyPublish({ registry, nextVersion: version });
  } catch (error) {
    console.error('Error publishin packages:\n' + error.message);
    throw error;
  }

  // package install
  try {
    console.info('Installing packages');
    nxRunManyNpmInstall({ registry, pkgVersion: version });
  } catch (error) {
    console.error('Error installing packages:\n' + error.message);
    throw error;
  }
}

export async function teardown() {
  if (activeRegistry && 'registryData' in activeRegistry) {
    const { stop } = activeRegistry;

    stopLocalRegistry(stop);
    nxRunManyNpmUninstall();
  } else {
    activeRegistry.stop();
    return;
  }
  await teardownTestFolder(e2eDir);
}
