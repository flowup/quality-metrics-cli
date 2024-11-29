import { type ExecutorContext, logger } from '@nx/devkit';
import { executeProcess } from '../../internal/execute-process';
// eslint-disable-next-line n/no-sync
import { createCliCommandArgs } from '../internal/cli';
import { normalizeContext } from '../internal/context';
import type { AutorunCommandExecutorOptions } from './schema';
import { parseAutorunExecutorOptions } from './utils';

export type ExecutorOutput = {
  success: boolean;
  command?: string;
  error?: Error;
};

export default async function runAutorunExecutor(
  terminalAndExecutorOptions: AutorunCommandExecutorOptions,
  context: ExecutorContext,
): Promise<ExecutorOutput> {
  const normalizedContext = normalizeContext(context);
  const cliArgumentObject = parseAutorunExecutorOptions(
    terminalAndExecutorOptions,
    normalizedContext,
  );
  const { dryRun, verbose, command } = terminalAndExecutorOptions;

  const processConfig = createCliCommandArgs({
    command,
    args: cliArgumentObject,
  });
  const commandString: string = `${processConfig.command} ${processConfig.args?.join(' ')}`;
  if (verbose) {
    logger.info(`Run CLI executor ${processConfig.command ?? ''}`);
    logger.info(`Command: ${commandString}`);
  }
  if (dryRun) {
    logger.warn(`DryRun execution of: ${processConfig}`);
  } else {
    try {
      // @TODO use executeProcess instead of execSync -> non blocking, logs #761
      // eslint-disable-next-line n/no-sync
      await executeProcess({
        ...processConfig,
        observer: {
          onStdout: data => {
            logger.info(data);
          },
          onError: error => {
            logger.error(error);
          },
        },
      });
    } catch (error) {
      logger.error(error);
      return Promise.resolve({
        success: false,
        command: commandString,
        error: error as Error,
      });
    }
  }

  return Promise.resolve({
    success: true,
    command: commandString,
  });
}
