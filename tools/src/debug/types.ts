// options for `bin/list-processes`
import { ProcessListOption } from './utils';

export type PID = string | number;
export type ListProcessesBinOptions = ProcessListOption & {
  slice?: number;
};

export type KillProcessesBinOptions = ProcessListOption & {
  force: boolean;
};
