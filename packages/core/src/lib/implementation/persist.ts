import { existsSync, mkdirSync } from 'fs';
import { stat, writeFile } from 'fs/promises';
import { join } from 'path';
import { CoreConfig, Report, reportFileName } from '@code-pushup/models';
import {
  MultipleFileResults,
  reportToMd,
  reportToStdout,
  scoreReport,
} from '@code-pushup/utils';

export class PersistDirError extends Error {
  constructor(outputDir: string) {
    super(`outPath: ${outputDir} is no directory.`);
  }
}

export class PersistError extends Error {
  constructor(reportPath: string) {
    super(`fileName: ${reportPath} could not be saved.`);
  }
}

export async function persistReport(
  report: Report,
  config: CoreConfig,
): Promise<MultipleFileResults> {
  const { persist } = config;
  const outputDir = persist.outputDir;
  const filename = persist?.filename || reportFileName(report);
  let { format } = persist;
  format = format && format.length !== 0 ? format : ['stdout'];
  let scoredReport;
  if (format.includes('stdout')) {
    scoredReport = scoreReport(report);
    reportToStdout(scoredReport);
  }

  // collect physical format outputs
  const results: { format: string; content: string }[] = [
    // JSON is always persisted
    { format: 'json', content: JSON.stringify(report, null, 2) },
  ];

  if (format.includes('md')) {
    scoredReport = scoredReport || scoreReport(report);
    results.push({ format: 'md', content: reportToMd(scoredReport) });
  }

  if (!existsSync(outputDir)) {
    try {
      mkdirSync(outputDir, { recursive: true });
    } catch (e) {
      console.warn(e);
      throw new PersistDirError(outputDir);
    }
  }

  // write relevant format outputs to file system
  return Promise.allSettled(
    results.map(({ format, content }) => {
      const reportPath = join(outputDir, `${filename}.${format}`);

      return (
        writeFile(reportPath, content)
          // return reportPath instead of void
          .then(() => stat(reportPath))
          .then(stats => [reportPath, stats.size] as const)
          .catch(e => {
            console.warn(e);
            throw new PersistError(reportPath);
          })
      );
    }),
  );
}
