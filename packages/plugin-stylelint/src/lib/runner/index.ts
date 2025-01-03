import { type LinterOptions } from 'stylelint';
import type { RunnerFunction } from '@code-pushup/models';
import { lintStyles } from './stylelint-runner.js';
import { mapStylelintResultsToAudits } from './utils.js';

export function createRunnerFunction(opt: LinterOptions): RunnerFunction {
  return async () => {
    const report = await lintStyles(opt);
    return mapStylelintResultsToAudits(report);
  };
}
