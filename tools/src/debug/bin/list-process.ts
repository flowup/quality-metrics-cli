import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ListProcessesBinOptions, PID } from '../types';
import { listProcess } from '../utils';

const { commandFilter, pid, verbose, slice } = yargs(hideBin(process.argv))
  .version(false)
  .options({
    verbose: { type: 'boolean' },
    commandFilter: { type: 'string' },
    pid: { type: 'string', default: [] },
    slice: { type: 'number', default: 9 },
  })
  // normalize to PID[]
  .coerce('commandFilter', commandFilter => commandFilter.trim())
  .coerce('pid', pid =>
    Array.isArray(pid) ? pid : pid !== '' ? pid.split(',') : [],
  ).argv as Omit<ListProcessesBinOptions, 'pid' | 'slice'> & { pid: PID[] } & {
  slice: number;
};

verbose && commandFilter && console.log(`Command Regex: ${commandFilter}`);
verbose &&
  pid &&
  pid.length < 0 &&
  console.log(`PID Filter: ${pid.join(', ')}`);

const processesToLog = listProcess({ commandFilter, pid }).slice(-slice); // show only first N processes

if (processesToLog.length === 0) {
  console.info(
    `No processes found. Filter: ${JSON.stringify(
      { commandFilter, pid },
      null,
      2,
    )}`,
  );
}

processesToLog.forEach(({ pid, command }) => {
  console.log(`${pid}: ${command}`);
});
