import { ArgumentsCamelCase, CommandModule } from 'yargs';
import { upload } from '@code-pushup/core';
import { ConfigMiddlewareOutput } from '../implementation/config-middleware';
import { uploadConfigSchema } from '@code-pushup/models';

export function yargsUploadCommandObject() {
  return {
    command: 'upload',
    describe: 'Upload report results to the portal',
    handler: async <T>(args: ArgumentsCamelCase<T>) => {
      const _args = args as unknown as ConfigMiddlewareOutput;
      const uploadOptions = {
        ..._args,
        upload: uploadConfigSchema.parse(_args.upload),
      };
      await upload(uploadOptions);
    },
  } satisfies CommandModule;
}
