import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { KillProcessesBinOptions, PID } from '../types';
import { killProcessPid, killProcesses } from '../utils';

const { commandFilter, pid, verbose, force } = yargs(hideBin(process.argv))
  .version(false)
  .options({
    force: { type: 'boolean', default: false },
    verbose: { type: 'boolean' },
    commandFilter: { type: 'string' },
    pid: { type: 'string' },
  })
  // normalize to PID[]
  .coerce('pid', pid =>
    Array.isArray(pid) ? pid : pid !== '' ? pid.split(',') : [],
  ).argv as Omit<KillProcessesBinOptions, 'pid'> & { pid: PID[] };

verbose && commandFilter && console.log(`Command Filter: ${commandFilter}`);
verbose && pid != null && console.log(`PID Filter: ${pid.join(', ')}`);

if (!pid && !commandFilter && !pid && !force) {
  throw new Error(
    'This would killall processes. Please provide a PID or a command filter and a PID filter. (or pass --force if you really want to kill ALL processes)',
  );
}

killProcesses({ commandFilter, pid, verbose });
