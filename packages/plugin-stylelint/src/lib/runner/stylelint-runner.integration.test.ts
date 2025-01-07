import path from 'node:path';
import type { LintResult } from 'stylelint';
import stylelint from 'stylelint';
import {
  type MockInstance,
  type MockedObject,
  type SpyInstance,
  beforeEach,
  describe,
  expect,
} from 'vitest';
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

describe('lintStyles configured for css', () => {
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

  it('should lint files correctly', async () => {
    const lintResult = await lintStyles({
      configFile: path.join(
        fixturesCssRoot,
        '.stylelintrc.color-no-invalid-hex.json',
      ),
      files: path.join(fixturesCssRoot, `${colorNoInvalidHexSlug}.css`),
    });

    expect(lintResult).toHaveLength(1);
    const { warnings, source } = lintResult.at(0) as LintResult;
    expect(source).pathToEndWith(`${colorNoInvalidHexSlug}.css`);
    expect(warnings).toStrictEqual([colorNoInvalidHexWarning]);
  });

  it('should lint files correctly with extended config', async () => {
    const lintResult = await lintStyles({
      configFile: path.join(fixturesCssRoot, '.stylelintrc.extends.json'),
      files: path.join(fixturesCssRoot, `${colorNoInvalidHexSlug}.css`),
    });

    expect(lintResult).toHaveLength(1);
    const { warnings, source } = lintResult.at(0) as LintResult;
    expect(source).pathToEndWith(`${colorNoInvalidHexSlug}.css`);
    expect(warnings).toStrictEqual([colorNoInvalidHexWarning]);
  });
});

describe('lintStyles configured for scss', () => {
  const fixturesScssRoot = path.join(fixturesDir, 'scss');

  it('should lint files correctly', async () => {
    const lintResult = await lintStyles({
      configFile: path.join(fixturesScssRoot, '.stylelintrc.basic.json'),
      files: path.join(fixturesScssRoot, `${colorNoInvalidHexSlug}.scss`),
    });

    expect(lintResult).toHaveLength(1);
    const { warnings, source } = lintResult.at(0) as LintResult;
    expect(source).pathToEndWith(`${colorNoInvalidHexSlug}.scss`);
    expect(warnings).toStrictEqual([colorNoInvalidHexWarning]);
  });
});

describe('lintStyles configured for less', () => {
  const fixturesScssRoot = path.join(fixturesDir, 'less');

  it('should lint files correctly', async () => {
    const lintResult = await lintStyles({
      configFile: path.join(
        fixturesScssRoot,
        '.stylelintrc.color-no-invalid-hex.json',
      ),
      files: path.join(fixturesScssRoot, `${colorNoInvalidHexSlug}.less`),
    });

    expect(lintResult).toHaveLength(1);
    const { warnings, source } = lintResult.at(0) as LintResult;
    expect(source).pathToEndWith(`${colorNoInvalidHexSlug}.less`);
    expect(warnings).toStrictEqual([colorNoInvalidHexWarning]);
  });
});
