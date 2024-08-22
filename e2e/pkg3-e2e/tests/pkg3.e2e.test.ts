import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PackageJson } from 'nx/src/utils/package-json';
import { expect } from 'vitest';
import { ensureEnvNxTaskTargetProject } from '@code-pushup/test-nx-utils';
import {
  ensureDirectoryExists,
  projectE2eScope,
} from '@code-pushup/test-utils';
import { executeProcess, readJsonFile } from '@code-pushup/utils';

const projectName = ensureEnvNxTaskTargetProject();
describe(`${projectName}-utils`, () => {
  const workspaceRoot = projectE2eScope(projectName);
  const sourceRoot = join(workspaceRoot, 'src');

  it('should have models installed in under devDependencies', async () => {
    const { devDependencies = {} } = await readJsonFile<PackageJson>(
      join(process.cwd(), workspaceRoot, 'package.json'),
    );
    expect(devDependencies).toStrictEqual(
      expect.objectContaining({
        '@code-pushup/models': expect.any(String),
      }),
    );
  });

  it('should have utils installed in under devDependencies', async () => {
    const { devDependencies = {} } = await readJsonFile<PackageJson>(
      join(process.cwd(), workspaceRoot, 'package.json'),
    );
    expect(devDependencies).toStrictEqual(
      expect.objectContaining({
        '@code-pushup/utils': expect.any(String),
      }),
    );
  });

  it('should execute models and utils package', async () => {
    // setup executable file using the packages
    await ensureDirectoryExists(sourceRoot);
    await writeFile(
      join(sourceRoot, 'index.ts'),
      [
        'import {type PersistConfig, persistConfigSchema} from "@code-pushup/models";',
        'import {executeProcess} from "@code-pushup/utils";',
        'const config: PersistConfig = persistConfigSchema.parse({ filename: "report"});',
        // eslint-disable-next-line no-template-curly-in-string
        'executeProcess({command: "echo", args: [`"${JSON.stringify(config)}"`], observer: {onStdout: (str)  => console.log(str)}});',
      ],
      { encoding: 'utf8' },
    );

    const { stdout } = await executeProcess({
      command: 'tsx',
      args: [join(sourceRoot, 'index.ts')],
    });
    expect(stdout).toContain('{filename:report}');
  });
});
