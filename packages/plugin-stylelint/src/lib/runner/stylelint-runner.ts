import stylelint, { type LinterOptions } from 'stylelint';

export type StyleLintOptions = Omit<LinterOptions, 'formatter'>;

// Run Stylelint Programmatically
export async function lintStyles({ config, ...options }: StyleLintOptions) {
  try {
    // eslint-disable-next-line functional/immutable-data
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
