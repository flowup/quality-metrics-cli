import { ensureEnvNxTaskTargetProject } from '@code-pushup/test-nx-utils';
import { executeProcess, objectToCliArgs } from '@code-pushup/utils';
import { teardownTestFolder } from './testing/test-setup/src';
import { projectE2eScope } from './testing/test-utils/src';
import { RegistryResult } from './tools/src/verdaccio/types';
import {
  nxStartVerdaccioAndSetupEnv,
  teardownVerdaccio,
} from './tools/src/verdaccio/verdaccio';

const projectName = ensureEnvNxTaskTargetProject();
let activeRegistry: RegistryResult | undefined;

export async function setup() {
  activeRegistry = await nxStartVerdaccioAndSetupEnv({
    projectName,
    verbose: true,
  });

  await executeProcess({
    command: 'npx',
    args: objectToCliArgs({
      _: ['nx', 'install-deps', projectName, '--'],
    }),
    env: process.env,
    // stdio: 'inherit', // @TODO enable stdio in executeProcess again
    shell: true,
    observer: {
      onStdout: data => {
        process.stdout.write(data);
      },
    },
  });
}

export async function teardown() {
  await teardownVerdaccio(activeRegistry);
  await teardownTestFolder(projectE2eScope(projectName));
}
