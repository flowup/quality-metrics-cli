import { join } from 'node:path';

type E2eScope<T extends string> = `tmp/e2e/${T}`;

/**
 * Returns typed path to e2e scope for a project
 * const z: 'tmp/e2e/project-name' = projectE2eScope('project-name');
 */
export function projectE2eScope<T extends string>(projectName: T) {
  return join('tmp', 'e2e', projectName) as E2eScope<T>; // so the user does not need to jump here to see the return type
}
