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
            'clean-npmrc': {
              command: `tsx --tsconfig={args.tsconfig} tools/debug/bin/clean-npmrc.ts --filePath="{args.filePath} --entriesToRemove="{args.entriesToRemove}"`,
              options: {
                tsconfig,
                verbose,
                slice: 9,
              },
            },
            'list-process': {
              command: `tsx --tsconfig={args.tsconfig} ${listProcessBin} --pid="{args.pid}" --commandFilter="{args.commandFilter}" --slice="{args.slice}" --verbose={args.verbose}`,
              options: {
                tsconfig,
                verbose,
                slice: 9,
              },
            },
            'kill-process': {
              command: `tsx --tsconfig={args.tsconfig} ${killProcessBin} --pid="{args.pid}" --commandFilter="{args.commandFilter}" --verbose={args.verbose}`,
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
