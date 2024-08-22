import { Tree } from '@nx/devkit';
import { join, relative } from 'node:path';
import { readProjectConfiguration } from 'nx/src/generators/utils/project-configuration';
import { expect } from 'vitest';
import { generateCodePushupConfig } from '@code-pushup/nx-plugin';
import {
  generateWorkspaceAndProject,
  materializeTree,
  registerPluginInWorkspace,
} from '@code-pushup/test-nx-utils';
import { removeColorCodes } from '@code-pushup/test-utils';
import { executeProcess } from '@code-pushup/utils';
import customPlugin from '../../../testing/test-utils/src/lib/fixtures/configs/custom-plugin';

// @TODO replace with default bin after https://github.com/code-pushup/cli/issues/643
export function relativePathToCwd(testDir: string): string {
  return relative(join(process.cwd(), testDir), process.cwd());
}

describe('pkg2', () => {
  let tree: Tree;
  const project = 'my-lib';
  const projectRoot = join('libs', project);
  const baseDir = 'tmp/nx-plugin-e2e/plugin';

  beforeEach(async () => {
    tree = await generateWorkspaceAndProject(project);
  });

  it('should execute cli with plugin pkg2', async () => {
    const cwd = join(baseDir, 'execute-dynamic-executor');
    const pathRelativeToPackage = relative(join(cwd, 'libs', project), cwd);
    registerPluginInWorkspace(tree, {
      plugin: '@code-pushup/nx-plugin',
      options: {
        verbose: true,
      },
    });
    const { root } = readProjectConfiguration(tree, project);
    generateCodePushupConfig(tree, root, {
      fileImports: `import type {CoreConfig} from "@code-pushup/models";`,
      plugins: [
        {
          fileImports: '',
          codeStrings: `customPlugin(${JSON.stringify(customPlugin)})`,
        },
      ],
    });
    await materializeTree(tree, cwd);

    const { stdout, stderr } = await executeProcess({
      command: 'npx',
      args: ['nx', 'run', `${project}:code-pushup`],
      cwd,
    });

    const cleanStderr = removeColorCodes(stderr);
    expect(cleanStderr).toContain(
      'DryRun execution of: npx @code-pushup/cli collect',
    );

    const cleanStdout = removeColorCodes(stdout);
    expect(cleanStdout).toContain(
      'NX   Successfully ran target code-pushup for project my-lib',
    );
  });
});
