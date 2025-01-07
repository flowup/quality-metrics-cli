import path from 'node:path';
import * as process from 'node:process';
// @ts-expect-error missing types for stylelint package after postinstall patch
import stylelint, { getConfigForFile } from 'stylelint';
import type { StyleLintTarget } from '../config.js';
import type { NormalizedStyleLintConfig } from './model.js';

/**
 * Function that consumes the StyleLint configuration processor and returns a normalized config
 * @param stylelintrc - The path to the StyleLint configuration file
 * @param cwd - The current working directory
 * @returns A normalized StyleLint configuration
 */
export function getNormalizedConfig({
  stylelintrc,
  cwd,
}: Required<Pick<StyleLintTarget, 'stylelintrc'>> & {
  cwd?: string;
}): Promise<NormalizedStyleLintConfig> {
  const _linter = stylelint._createLinter({ configFile: stylelintrc });
  const configFile =
    stylelintrc ?? path.join(cwd ?? process.cwd(), '.stylelintrc.json');
  return getConfigForFile(_linter, configFile);
}
