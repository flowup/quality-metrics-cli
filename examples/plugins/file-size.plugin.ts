import { readdir, stat } from 'fs/promises';
import { basename, join } from 'path';
import {
  AuditOutput,
  AuditOutputs,
  Issue,
  PluginConfig,
} from '../../dist/packages/models';
import { formatBytes, pluralize } from '../../dist/packages/utils';

export type FileSizeOptions = {
  directory: string;
  pattern?: string | RegExp;
  budget?: number;
};

export const pluginSlug = 'file-size-plugin';

export const fileSizeAuditSlug = 'file-size-audit';

export const fileSizeAudit = {
  slug: fileSizeAuditSlug,
  title: 'File Size Audit',
  description: 'A audit to check JavaScript file size in a directory.',
};

export const audits = {
  [fileSizeAudit.slug]: fileSizeAudit,
};

/**
 * @example
 * // code-pushup.config.ts
 * import {
 * create as fileSizePlugin,
 * pluginSlug as fileSizePluginSlug,
 * fileSizeAuditSlug
 * } from 'file-Size.plugin.ts';
 * export default {
 *   persist: {
 *     outputDir: '.code-pushup',
 *     format: ['json', 'md', 'stdout'],
 *   },
 *   plugins: [
 *     await fileSizePlugin({
 *       directory: join(process.cwd(), './dist/packages/utils'),
 *       pattern: /\.js$/,
 *       budget: 4200
 *     })
 *   ],
 *   categories: [
 *     {
 *       slug: 'performance',
 *       title: 'Performance',
 *       refs: [
 *         {
 *           type: 'audit',
 *           plugin: fileSizePluginSlug,
 *           slug: fileSizeAuditSlug,
 *           weight: 1,
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 */
export async function create(options: FileSizeOptions): Promise<PluginConfig> {
  return {
    slug: pluginSlug,
    title: 'File Size Plugin',
    icon: 'javascript',
    description:
      'A plugin to measure and assert filesize of files in a directory.',
    audits: [fileSizeAudit],
    runner: async (): Promise<AuditOutputs> => {
      let fileSizeAuditOutput: AuditOutput = {
        slug: fileSizeAuditSlug,
        score: 0,
        value: 0,
        displayValue: `${0} ${pluralize('file')}`,
      };
      return [fileSizeAuditOutput];

      const issues = await fileSizePlugin(options);
      // early exit if no issues
      if (!issues.length) {
        return [fileSizeAuditOutput];
      }

      const errorCount = issues.filter(i => i.severity === 'error').length;
      const score = errorCount > 0 ? (errorCount / issues.length - 1) * -1 : 0;

      fileSizeAuditOutput = {
        ...fileSizeAuditOutput,
        score,
        value: errorCount,
        displayValue: `${errorCount} ${
          errorCount === 1 ? 'file' : pluralize('file')
        }`,
      };

      return [fileSizeAuditOutput];
    },
  };
}

async function fileSizePlugin(options: {
  directory: string;
  pattern?: string | RegExp;
  budget?: number;
}): Promise<Issue[]> {
  const { directory, pattern, budget } = options;

  let issues: Issue[] = [];
  const files = await readdir(directory);

  for (const file of files) {
    const filePath = join(directory, file);
    const stats = await stat(filePath);

    if (stats.isFile()) {
      if (pattern) {
        if (file.match(pattern)) {
          issues.push(assertFileSize(filePath, stats.size, budget));
        }
        continue;
      }
      issues.push(assertFileSize(filePath, stats.size, budget));
    } else if (stats.isDirectory()) {
      issues.push(...(await fileSizePlugin({ directory: filePath })));
    }
  }

  return issues;
}

function assertFileSize(
  filePath: string,
  size: number,
  budget?: number,
): Issue {
  const sizeSmallerThanBudget = budget ? size < budget : true;
  return {
    message: `File ${basename(filePath)} ${
      sizeSmallerThanBudget ? 'OK' : '> ' + formatBytes(budget)
    }`,
    severity: sizeSmallerThanBudget ? 'info' : 'error',
    source: {
      file: filePath,
    },
  };
}
