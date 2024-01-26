import { describe } from 'vitest';
import { reportWithCategoriesMock } from '@code-pushup/testing-utils';
import { generateStdoutSummary } from './generate-stdout-summary';
import { scoreReport } from './scoring';
import { sortReport } from './sorting';

describe('report-to-stdout', () => {
  it('should contain all sections when using the fixture report', () => {
    const logOutput = generateStdoutSummary(
      sortReport(scoreReport(reportWithCategoriesMock())),
    );

    expect(logOutput).toContain('Categories');
    // logOutput.replace(/\u001B\[\d+m/g, '') removes all color codes from the output
    // for snapshot readability
    // eslint-disable-next-line no-control-regex
    expect(logOutput.replace(/\u001B\[\d+m/g, '')).toMatchSnapshot();
  });

  it('should not contain category sections when categories are empty', () => {
    const logOutput = generateStdoutSummary(
      sortReport(
        scoreReport({ ...reportWithCategoriesMock(), categories: [] }),
      ),
    );

    expect(logOutput).not.toContain('Categories');
    // logOutput.replace(/\u001B\[\d+m/g, '') removes all color codes from the output
    // for snapshot readability
    // eslint-disable-next-line no-control-regex
    expect(logOutput.replace(/\u001B\[\d+m/g, '')).toMatchSnapshot();
  });
});
