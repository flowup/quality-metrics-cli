import type { Audit, RunnerFunction } from '@code-pushup/models';
import { type StyleLintOptions, lintStyles } from './stylelint-runner.js';
import { stylelintResultsToAuditOutputs } from './utils.js';

export function createRunnerFunction(
  opt: StyleLintOptions,
  expectedAudits: Audit[],
): RunnerFunction {
  return async () => {
    const report = await lintStyles(opt);
    return stylelintResultsToAuditOutputs(report, expectedAudits);
  };
}
