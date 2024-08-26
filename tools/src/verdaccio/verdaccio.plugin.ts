import { type CreateNodes, readJsonFile } from '@nx/devkit';
import { dirname, join } from 'node:path';
import { type ProjectConfiguration } from 'nx/src/config/workspace-json-project-json';
import { projectE2eScope } from '../../../testing/test-utils/src';
import { TOOLS_TSCONFIG_PATH } from '../constants';
import { getAllDependencies, someTargetsPresent } from '../utils';
import {
  DEFAULT_VERDACCIO_CONFIG,
  START_VERDACCIO_ENV_TARGET_NAME,
  START_VERDACCIO_SERVER_TARGET_NAME,
} from './constants';
import { projectStorage, uniquePort } from './utils';

type CreateNodesOptions = {
  port?: string | number;
  config?: string;
  storage?: string;
  preTargets?: string | string[];
  verbose?: boolean;
  tsconfig?: string;
};

export const createNodes: CreateNodes = [
  '**/project.json',
  async (projectConfigurationFile: string, opts: undefined | unknown) => {
    const { config = '.verdaccio/config.yml', preTargets = ['e2e-verdaccio', 'e2e'] } =
      (opts ?? {}) as CreateNodesOptions;
    const root = dirname(projectConfigurationFile);
    const projectConfiguration: Required<ProjectConfiguration> = readJsonFile(
      projectConfigurationFile,
    );

    const hasPreVerdaccioTargets = someTargetsPresent(
      projectConfiguration?.targets ?? {},
      preTargets,
    );
    if (!hasPreVerdaccioTargets) {
      return {};
    }

    const { name: projectName } = projectConfiguration;

    return {
      projects: {
        [root]: {
          targets: {
            ...verdaccioTargets({
              port:
                projectConfiguration?.targets?.[
                  START_VERDACCIO_SERVER_TARGET_NAME
                ]?.options?.port ?? uniquePort(),
              config,
              storage: projectStorage(projectName),
              preTargets,
              projectName,
              dependencies: await getAllDependencies(projectName),
            }),
          },
        },
      },
    };
  },
];

function verdaccioTargets({
  port,
  config = DEFAULT_VERDACCIO_CONFIG,
  storage,
  projectName,
  dependencies,
}: Required<Omit<CreateNodesOptions, 'verbose' | 'tsconfig'>> & {
  projectName: string;
  dependencies: string[];
}) {
  return {
    [START_VERDACCIO_SERVER_TARGET_NAME]: {
      executor: '@nx/js:verdaccio',
      options: {
        verbose: true,
      },
    },
    [START_VERDACCIO_ENV_TARGET_NAME]: {
      command: `tsx --tsconfig=${TOOLS_TSCONFIG_PATH} tools/src/verdaccio/bin/create-verdaccio-env.ts --projectName={args.projectName} --storage={args.storage} --port={args.port} --verbose={args.verbose}`,
      options: {
        port,
        config,
        storage,
        projectName,
      },
    },
    'stop-verdaccio': {
      command: `tsx tools/src/debug/bin/kill-process.ts --commandRegex="npx nx run start-verdaccio ${projectName}"`,
    },
    'install-deps': {
      executor: 'nx:run-commands',
      options: {
        parallel: false,
        commands: [
          {
            // https://docs.npmjs.com/cli/v8/commands/npm-install#global (explains the prefix flag to install dependencies in a different directory)
            command: `npx nx run-many --projects=${dependencies.join(
              ',',
            )} -t publish --prefix=${join(
              projectE2eScope(projectName),
            )} --userconfig=${join(
              projectE2eScope(projectName),
              '.npmrc',
            )} --registry=http://localhost:${port}`,
          },
          {
            // https://docs.npmjs.com/cli/v8/commands/npm-install#global (explains the `prefix` flag to install dependencies in a different directory)
            command: `npx nx run-many --projects=${dependencies.join(
              ',',
            )} -t npm-install --prefix=./${join(
              projectE2eScope(projectName),
            )} --userconfig=./${join(
              projectE2eScope(projectName),
              '.npmrc',
            )} --registry=http://localhost:${port}`,
          },
        ],
      },
    },
    'install-deps-wip': {
      dependsOn: ['^npm-install'],
      command: `echo Installing dependencies done!`,
      options: {
        prefix: join(projectE2eScope(projectName)),
        registry: `http://localhost:${port}`,
      },
    },
  };
}
