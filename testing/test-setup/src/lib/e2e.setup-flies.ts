import { join } from 'node:path';
import { afterEach } from 'vitest';
import { teardownTestFolder } from '@code-pushup/test-setup';

export function projectE2eScope(projectName: string) {
  return join('tmp', 'e2e', projectName);
}

export function ensureEnvNxTaskTargetProject(): string {
  if (process.env['NX_TASK_TARGET_PROJECT'] == null) {
    throw new Error(
      'env var NX_TASK_TARGET_PROJECT not set. Normally done by Nx automatically.',
    );
  }
  return process.env['NX_TASK_TARGET_PROJECT'];
}

afterEach(async () => {
  const projectName = ensureEnvNxTaskTargetProject();
  await teardownTestFolder(join(projectE2eScope(projectName), 'src'));
});
