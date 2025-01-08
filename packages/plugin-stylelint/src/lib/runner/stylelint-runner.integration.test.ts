import path from 'node:path';
import type { LintResult } from 'stylelint';
import stylelint from 'stylelint';
import { type MockInstance, beforeEach, describe, expect } from 'vitest';
import { lintStyles } from './stylelint-runner.js';

const fixturesDir = path.join(
  'packages',
  'plugin-stylelint',
  'mocks',
  'fixtures',
);
const colorNoInvalidHexSlug = 'color-no-invalid-hex';
const colorNoInvalidHexWarning = {
  column: 10,
  endColumn: 13,
  endLine: 3,
  line: 3,
  rule: colorNoInvalidHexSlug,
  severity: 'error',
  text: `Unexpected invalid hex color "#34" (${colorNoInvalidHexSlug})`,
  url: undefined,
};
const fixturesCssRoot = path.join(fixturesDir, 'css');
let lintSpy: MockInstance<
  [stylelint.LinterOptions], // Arguments of stylelint.lint
  Promise<stylelint.LinterResult> // Return type of stylelint.lint
>;

describe('lintStyles', () => {
  beforeEach(() => {
    lintSpy = vi.spyOn(stylelint, 'lint');
  });

  it('should use stylelint.lint with format set to "json" statically to generate lint results', async () => {
    const options = {
      configFile: path.join(
        fixturesCssRoot,
        '.stylelintrc.color-no-invalid-hex.json',
      ),
      files: path.join(fixturesCssRoot, `${colorNoInvalidHexSlug}.css`),
    };

    await expect(lintStyles(options)).resolves.not.toThrow();

    expect(lintSpy).toHaveBeenCalledTimes(1);
    expect(lintSpy).toHaveBeenCalledWith({
      ...options,
      formatter: 'json', // added inside lintStyles
    });
  });

  it('should return a LintResult object', async () => {
    const options = {
      configFile: path.join(
        fixturesCssRoot,
        '.stylelintrc.color-no-invalid-hex.json',
      ),
      files: path.join(fixturesCssRoot, `${colorNoInvalidHexSlug}.css`),
    };

    await expect(lintStyles(options)).resolves.toStrictEqual([
      {
        errored: true,
        ignored: undefined,
        _postcssResult: expect.any(Object),
        source: expect.pathToEndWith('css/color-no-invalid-hex.css'),
        deprecations: [],
        invalidOptionWarnings: [],
        parseErrors: [],
        warnings: [colorNoInvalidHexWarning],
      },
    ]);
  });

  it('should throw an error if stylelint.lint fails', async () => {
    await expect(lintStyles({})).rejects.toThrow(
      'Error while linting: Error: You must pass stylelint a `files` glob or a `code` string, though not both',
    );
  });
});

describe.each([['css'], ['scss'], ['less']])(
  'lintStyles configured for %s',
  format => {
    const formatRoot = path.join(fixturesDir, format);
    beforeEach(() => {
      lintSpy = vi.spyOn(stylelint, 'lint');
    });

    it('should lint files correctly', async () => {
      const lintResult = await lintStyles({
        configFile: path.join(
          formatRoot,
          `.stylelintrc.${colorNoInvalidHexSlug}.json`,
        ),
        files: path.join(formatRoot, `${colorNoInvalidHexSlug}.${format}`),
      });

      expect(lintResult).toHaveLength(1);
      const { warnings, source } = lintResult.at(0) as LintResult;
      expect(source).pathToEndWith(`${colorNoInvalidHexSlug}.${format}`);
      expect(warnings).toStrictEqual([colorNoInvalidHexWarning]);
    });

    it('should lint files correctly with extended config', async () => {
      const lintResult = await lintStyles({
        configFile: path.join(formatRoot, '.stylelintrc.extends.json'),
        files: path.join(formatRoot, `${colorNoInvalidHexSlug}.${format}`),
      });

      expect(lintResult).toHaveLength(1);
      const { warnings, source } = lintResult.at(0) as LintResult;
      expect(source).pathToEndWith(`${colorNoInvalidHexSlug}.${format}`);
      expect(warnings).toStrictEqual([colorNoInvalidHexWarning]);
    });
  },
);

describe.each([['js'], ['cjs'], ['mjs'], ['yml'], ['json']])(
  'lintStyles configured with a configFile of format %s',
  configFileFormat => {
    const formatRoot = path.join(fixturesDir, 'config-format');
    beforeEach(() => {
      lintSpy = vi.spyOn(stylelint, 'lint');
    });

    it('should lint files correctly', async () => {
      const lintResult = await lintStyles({
        configFile: path.join(formatRoot, `.stylelintrc.${configFileFormat}`),
        files: `${formatRoot}/*.css`,
      });

      expect(lintResult).toHaveLength(1);
      const { warnings, source } = lintResult.at(0) as LintResult;
      expect(source).pathToEndWith(`${colorNoInvalidHexSlug}.css`);
      expect(warnings).toStrictEqual([colorNoInvalidHexWarning]);
    });
  },
);
