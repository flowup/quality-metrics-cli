import yargs, { Options } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { CleanNpmrcOptions, cleanNpmrc } from '../utils';

const argv = yargs(hideBin(process.argv))
  .version(false)
  .options({
    filePath: { type: 'string' },
    entriesToRemove: { type: 'array' },
  } satisfies Partial<Record<'filePath' | 'verbose' | 'entriesToRemove', Options>>)
  .coerce('entriesToRemove', entriesToRemove =>
    Array.isArray(entriesToRemove) ? entriesToRemove : [entriesToRemove],
  ).argv;

const { filePath, entriesToRemove = [] } = argv as CleanNpmrcOptions;
cleanNpmrc({
  filePath,
  entriesToRemove,
});
