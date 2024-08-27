import yargs, { Options } from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  type NxStarVerdaccioOptions,
  nxStartVerdaccioAndSetupEnv,
} from '../verdaccio';

const argv = yargs(hideBin(process.argv))
  .version(false)
  .options({
    verbose: { type: 'boolean' },
    projectName: { type: 'string', demandOption: true },
    workspaceRoot: { type: 'string' },
    targetName: { type: 'string' },
    port: { type: 'string' },
  } satisfies Partial<Record<keyof NxStarVerdaccioOptions, Options>>).argv;

(async () => {
  const registryResult = await nxStartVerdaccioAndSetupEnv(
    argv as NxStarVerdaccioOptions,
  );
  process.exit(0);
})();
