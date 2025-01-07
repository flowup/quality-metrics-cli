import type { LintResult } from 'stylelint';
import { describe, expect } from 'vitest';
import { lintStyles } from './stylelint-runner.js';

describe('lintStyles', () => {
  it('should lint scss', async () => {
    const lintResult = await lintStyles({
      configFile:
        'packages/plugin-stylelint/mocks/fixtures/scss/.stylelintrc.extends.json',
      files: 'packages/plugin-stylelint/mocks/fixtures/scss/**/*.scss',
    });

    expect(lintResult).toHaveLength(1);
    const { warnings, source } = lintResult.at(0) as LintResult;
    expect(source).pathToEndWith('styles.scss');
    expect(warnings).toStrictEqual([
      {
        column: 17,
        endColumn: 20,
        endLine: 1,
        line: 1,
        rule: 'color-no-invalid-hex',
        severity: 'error',
        text: 'Unexpected invalid hex color "#34" (color-no-invalid-hex)',
        url: undefined,
      },
    ]);
  });
});
