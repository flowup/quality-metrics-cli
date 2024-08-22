import { type CreateNodes, type CreateNodesContext } from '@nx/devkit';
import { dirname } from 'node:path';
import { TOOLS_TSCONFIG_PATH } from '../constants';
import { KILL_PROCESS_BIN, LIST_PROCESS_BIN } from './constants';

type CreateNodesOptions = {
  tsconfig?: string;
  listProcessBin?: string;
  killProcessBin?: string;
  verbose?: boolean;
};

export const createNodes: CreateNodes = [
  '**/project.json',
  (
    projectConfigurationFile: string,
    opts: undefined | unknown,
    context: CreateNodesContext,
  ) => {
    const root = dirname(projectConfigurationFile);

    if (root !== '.') {
      return {};
    }

    const {
      tsconfig = TOOLS_TSCONFIG_PATH,
      listProcessBin = LIST_PROCESS_BIN,
      killProcessBin = KILL_PROCESS_BIN,
      verbose = false,
    } = (opts ?? {}) as CreateNodesOptions;

    return {
      projects: {
        [root]: {
          targets: {
            'list-process': {
              command: `tsx --tsconfig={args.tsconfig} ${listProcessBin} --pid="{args.pid}" --commandRegex="{args.commandRegex}" --slice="{args.slice}" --verbose={args.verbose}`,
              options: {
                tsconfig,
                verbose,
                slice: 9,
              },
            },
            'kill-process': {
              command: `tsx --tsconfig={args.tsconfig} ${killProcessBin} --pid="{args.pid}" --commandRegex="{args.commandRegex}" --verbose={args.verbose}`,
              options: {
                tsconfig,
                verbose,
              },
            },
          },
        },
      },
    };
  },
];
