export function ensureEnvNxTaskTargetProject(): string {
  if (process.env['NX_TASK_TARGET_PROJECT'] == null) {
    throw new Error(
      'env var NX_TASK_TARGET_PROJECT not set. Normally done by Nx automatically.',
    );
  }
  return process.env['NX_TASK_TARGET_PROJECT'];
}
