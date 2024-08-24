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
    directory: { type: 'string' },
    targetName: { type: 'string' },
    port: { type: 'string' },
  } satisfies Partial<Record<keyof NxStarVerdaccioOptions, Options>>).argv;

nxStartVerdaccioAndSetupEnv(argv as NxStarVerdaccioOptions);
