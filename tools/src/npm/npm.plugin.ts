import {
  type CreateNodes,
  type CreateNodesContext,
  readJsonFile,
} from '@nx/devkit';
import { dirname, join } from 'node:path';
import { type ProjectConfiguration } from 'nx/src/config/workspace-json-project-json';
import { NPM_CHECK_SCRIPT } from './constants';

type CreateNodesOptions = {
  tsconfig?: string;
  npmCheckScript?: string;
  verbose?: boolean;
  publishableTargets?: string;
};
export const createNodes: CreateNodes = [
  '**/project.json',
  (
    projectConfigurationFile: string,
    opts: undefined | unknown,
    context: CreateNodesContext,
  ) => {
    const root = dirname(projectConfigurationFile);
    const projectConfiguration: ProjectConfiguration = readJsonFile(
      projectConfigurationFile,
    );
    const {
      publishableTargets = 'publishable',
      tsconfig = 'tools/tsconfig.tools.json',
      npmCheckScript = NPM_CHECK_SCRIPT,
      verbose = false,
    } = (opts ?? {}) as CreateNodesOptions;

    const isPublishable = Boolean(
      projectConfiguration?.targets[publishableTargets],
    );
    if (!isPublishable) {
      return {};
    }

    return {
      projects: {
        [root]: {
          targets: npmTargets({ root, tsconfig, npmCheckScript, verbose }),
        },
      },
    };
  },
];

function npmTargets({
  root,
  tsconfig,
  npmCheckScript,
  verbose,
}: Required<Omit<CreateNodesOptions, 'publishableTargets'>> & {
  root: string;
}) {
  const { name: packageName } = readJsonFile(join(root, 'package.json'));
  return {
    'npm-check': {
      command: `tsx --tsconfig={args.tsconfig} {args.script} --pkgRange=${packageName}@{args.pkgVersion} --registry={args.registry} --verbose=${verbose}`,
      options: {
        script: npmCheckScript,
        tsconfig,
      },
    },
    'npm-install': {
      command: `npm install -D ${packageName}@{args.pkgVersion} --registry={args.registry}`,
    },
    'npm-uninstall': {
      command: `npm uninstall ${packageName}`,
    },
  };
}
