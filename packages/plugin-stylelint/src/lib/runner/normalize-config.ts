import path from 'node:path';
import * as process from 'node:process';
// @ts-expect-error missing types for stylelint package after postinstall patch
import stylelint, { getConfigForFile } from 'stylelint';
import type { StyleLintTarget } from '../config.js';
import type { RcPath } from '../types';
import type { NormalizedStyleLintConfig } from './model.js';

const NORMALIZED_CONFIG_CACHE = new Map<string, NormalizedStyleLintConfig>();
/**
 * Function that consumes the StyleLint configuration processor and returns a normalized config
 * @param stylelintrc - The path to the StyleLint configuration file
 * @param cwd - The current working directory
 * @returns A normalized StyleLint configuration
 */
export function getNormalizedConfig({
  stylelintrc,
  cwd,
}: RcPath & {
  cwd?: string;
}): Promise<NormalizedStyleLintConfig> {
  const parsedStylelintrc =
    stylelintrc ?? path.join(cwd ?? process.cwd(), '.stylelintrc.json'); // @TODO use a const
  if (NORMALIZED_CONFIG_CACHE.get(parsedStylelintrc) === undefined) {
    const _linter = stylelint._createLinter({ configFile: stylelintrc });
    NORMALIZED_CONFIG_CACHE.set(
      parsedStylelintrc,
      getConfigForFile(_linter, parsedStylelintrc),
    );
  }
  return Promise.resolve(
    NORMALIZED_CONFIG_CACHE.get(parsedStylelintrc) as NormalizedStyleLintConfig,
  );
}
