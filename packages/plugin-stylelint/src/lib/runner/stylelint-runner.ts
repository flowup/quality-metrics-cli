import stylelint, { type LinterOptions } from 'stylelint';

export type StyleLintOptions = Omit<LinterOptions, 'formatter'>;

/**
 * Function that runs Stylelint programmatically with a certain configuration to run it and get
 * the results that Stylelint would get
 * @param config Configuration to run Stylelint
 * @param options Options
 * @returns The StyleLint process result
 */
export async function lintStyles({ config, ...options }: StyleLintOptions) {
  try {
    // eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-empty-function
    globalThis.console.assert = globalThis.console.assert || (() => {});
    const { results } = await stylelint.lint({
      ...options,
      formatter: 'json',
    });
    return results;
  } catch (error) {
    throw new Error(`Error while linting: ${error}`);
  }
}
