import { Tree } from '@nx/devkit';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, expect } from 'vitest';
import {
  generateWorkspaceAndProject,
  materializeTree,
} from '@code-pushup/test-nx-utils';
import { removeColorCodes } from '@code-pushup/test-utils';
import { distPluginPackage, executeGenerator } from '../mocks/utils';

function executeInitGenerator(args: string[], cwd: string = process.cwd()) {
  return executeGenerator(args, {
    bin: distPluginPackage(cwd),
    generator: 'init',
    cwd,
  });
}

describe('nx-plugin g init', () => {
  let tree: Tree;
  const project = 'my-lib';
  const baseDir = 'tmp/nx-plugin-e2e/generators/init';

  const generatorExecMsgRegex = (cwd: string) =>
    `NX  Generating ${distPluginPackage(cwd)}:init`;
  const createNxJsonMsgRegex = /^UPDATE nx.json/m;
  const updatePackageJsonMsgRegex = /^UPDATE package.json/m;

  beforeEach(async () => {
    tree = await generateWorkspaceAndProject(project);
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  it('should inform about dry run', async () => {
    const cwd = join(baseDir, 'dry-run');
    await materializeTree(tree, cwd);

    const { stderr } = await executeInitGenerator([project, '--dryRun'], cwd);

    const cleanedStderr = removeColorCodes(stderr);
    expect(cleanedStderr).toContain(
      'NOTE: The "dryRun" flag means no changes were made.',
    );
  });

  it('should update packages.json and configure nx.json', async () => {
    const cwd = join(baseDir, 'nx-update');
    await materializeTree(tree, cwd);

    const { code, stdout } = await executeInitGenerator(
      [project, '--dryRun'],
      cwd,
    );
    expect(code).toBe(0);
    const cleanedStdout = removeColorCodes(stdout);
    expect(cleanedStdout).toContain(generatorExecMsgRegex(cwd));
    expect(cleanedStdout).toMatch(updatePackageJsonMsgRegex);
    expect(cleanedStdout).toMatch(createNxJsonMsgRegex);
  });

  it('should skip packages.json update if --skipPackageJson is given', async () => {
    const cwd = join(baseDir, 'skip-packages');
    await materializeTree(tree, cwd);

    const { code, stdout } = await executeInitGenerator(
      [project, '--skipPackageJson', '--dryRun'],
      cwd,
    );
    expect(code).toBe(0);
    const cleanedStdout = removeColorCodes(stdout);
    expect(cleanedStdout).toContain(generatorExecMsgRegex(cwd));
    expect(cleanedStdout).not.toMatch(updatePackageJsonMsgRegex);
    expect(cleanedStdout).toMatch(createNxJsonMsgRegex);
  });
});
