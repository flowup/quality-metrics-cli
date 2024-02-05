import chalk from 'chalk';
import { ArgumentsCamelCase, CommandModule } from 'yargs';
import { UploadOptions, upload } from '@code-pushup/core';
import { CLI_NAME } from '../constants';
import { renderIntegratePortalHint, ui } from '../implementation/logging';

export function yargsUploadCommandObject() {
  const command = 'upload';
  return {
    command,
    describe: 'Upload report results to the portal',
    handler: async <T>(args: ArgumentsCamelCase<T>) => {
      ui().logger.log(chalk.bold(CLI_NAME));
      ui().logger.info(chalk.gray(`Run ${command}...`));

      const options = args as unknown as UploadOptions;
      if (!options.upload) {
        renderIntegratePortalHint();
        throw new Error('Upload configuration not set');
      }
      await upload(options);
    },
  } satisfies CommandModule;
}
