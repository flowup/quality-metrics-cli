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

  it('should use stylelint.lint to generate lint results', async () => {
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

describe('lintStyles configured for different style formats', () => {
  beforeEach(() => {
    lintSpy = vi.spyOn(stylelint, 'lint');
  });

  it.each([['css'], ['scss'], ['less']])(
    'should lint files correctly for %s',
    async format => {
      const formatRoot = path.join(fixturesDir, format);

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
    },
  );
});

describe('lintStylescustom', () => {
  beforeEach(() => {
    lintSpy = vi.spyOn(stylelint, 'lint');
  });
  // it would work with ts files too, but it erases the mjs if so
  it.each([['js'], ['mjs'], ['cjs'], ['yml'], ['json']])(
    'should lint files correctly with a configFile of format %s',
    async configFileFormat => {
      const formatRoot = path.join(fixturesDir, 'config-format');
      const lintResult = await lintStyles({
        configFile: path.join(formatRoot, `.stylelintrc.${configFileFormat}`),
        files: `${formatRoot}/*.css`,
      });

      expect(lintResult).toHaveLength(1);
      const { warnings, source } = lintResult.at(0) as LintResult;
      expect(source).pathToEndWith(`${colorNoInvalidHexSlug}.css`);
      expect(warnings).toStrictEqual([colorNoInvalidHexWarning]);
    },
  );
});

describe('lintStyles logic with extends', () => {
  const formatRoot = path.join(fixturesDir, 'extend-rules');

  it('should lint files correctly without extends', async () => {
    const lintResult = await lintStyles({
      configFile: path.join(formatRoot, '.stylelintrc.block-no-empty.json'),
      files: `${formatRoot}/color-no-invalid-hex-plus-block-no-empty.css`,
    });

    expect(lintResult).toHaveLength(1);
    const { warnings } = lintResult.at(0) as LintResult;
    expect(warnings).toHaveLength(1);
    expect(warnings.at(0)!.rule).toStrictEqual('block-no-empty');
  });

  it('should lint files correctly and consider its extends', async () => {
    const lintResult = await lintStyles({
      configFile: path.join(
        formatRoot,
        '.stylelintrc.color-no-invalid-hex-plus-extends.json',
      ),
      files: `${formatRoot}/color-no-invalid-hex-plus-block-no-empty.css`,
    });

    expect(lintResult).toHaveLength(1);
    const { warnings } = lintResult.at(0) as LintResult;

    expect(warnings).toContainEqual(
      expect.objectContaining({
        rule: 'block-no-empty',
      }),
    );
    expect(warnings).toContainEqual(
      expect.objectContaining({
        rule: 'color-no-invalid-hex',
      }),
    );
  });
});
