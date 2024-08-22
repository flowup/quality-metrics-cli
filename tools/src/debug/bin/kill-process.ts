import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { KillProcessesBinOptions, PID } from '../types';
import { killProcessPid, killProcesses } from '../utils';

const { commandRegex, pid, verbose, force } = yargs(hideBin(process.argv))
  .version(false)
  .options({
    force: { type: 'boolean', default: false },
    verbose: { type: 'boolean' },
    commandRegex: { type: 'string' },
    pid: { type: 'string' },
  })
  // normalize to PID[]
  .coerce('pid', pid =>
    Array.isArray(pid) ? pid : pid !== '' ? pid.split(',') : [],
  ).argv as Omit<KillProcessesBinOptions, 'pid'> & { pid: PID[] };

verbose && commandRegex && console.log(`Command Filter: ${commandRegex}`);
verbose && pid != null && console.log(`PID Filter: ${pid.join(', ')}`);

if (!pid && !commandRegex && !pid && !force) {
  throw new Error(
    'This would killall processes. Please provide a PID or a command filter and a PID filter. (or pass --force if you really want to kill ALL processes)',
  );
}

killProcesses({ commandRegex, pid, verbose });
