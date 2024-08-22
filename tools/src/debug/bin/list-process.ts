import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ListProcessesBinOptions, PID } from '../types';
import { listProcess } from '../utils';

const { commandRegex, pid, verbose, slice } = yargs(hideBin(process.argv))
  .version(false)
  .options({
    verbose: { type: 'boolean' },
    commandRegex: { type: 'string' },
    pid: { type: 'string', default: [] },
    slice: { type: 'number', default: 9 },
  })
  // normalize to PID[]
  .coerce('commandRegex', commandRegex => commandRegex.trim())
  .coerce('pid', pid =>
    Array.isArray(pid) ? pid : pid !== '' ? pid.split(',') : [],
  ).argv as Omit<ListProcessesBinOptions, 'pid'> & { pid: PID[] };

verbose && commandRegex && console.log(`Command Regex: ${commandRegex}`);
verbose &&
  pid &&
  pid.length < 0 &&
  console.log(`PID Filter: ${pid.join(', ')}`);

const processesToLog = listProcess({ commandRegex, pid }).slice(-slice); // show only first N processes

if (processesToLog.length === 0) {
  console.info(
    `No processes found. Filter: ${JSON.stringify(
      { commandRegex, pid },
      null,
      2,
    )}`,
  );
}

processesToLog.forEach(({ pid, command }) => {
  console.log(`${pid}: ${command}`);
});
