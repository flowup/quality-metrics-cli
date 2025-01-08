import path from 'node:path';
import { describe, expect, it } from 'vitest';
import extendedConfigUnprocessed from '../../../mocks/fixtures/get-normalized-config/.stylelintrc.js';
import baseConfigUnprocessed from '../../../mocks/fixtures/get-normalized-config/index.js';
import { getNormalizedConfig } from './normalize-config.js';

describe('getNormalizedConfig', () => {
  const extendedConfigPath = path.join(
    process.cwd(),
    'packages/plugin-stylelint/mocks/fixtures/get-normalized-config/.stylelintrc.ts',
  );

  const baseConfigPath = path.join(
    process.cwd(),
    'packages/plugin-stylelint/mocks/fixtures/get-normalized-config/index.ts',
  );

  const jsonConfigPath = path.join(
    process.cwd(),
    'packages/plugin-stylelint/mocks/fixtures/get-normalized-config/.stylelintrc.json',
  );

  it('should get config from specified JSON file', async () => {
    const extendedConfigNormalized = await getNormalizedConfig({
      stylelintrc: jsonConfigPath,
    });
    expect(extendedConfigNormalized).toMatchSnapshot();
  });

  it('should get config from specified JS/TS file', async () => {
    const baseConfigNormalized = await getNormalizedConfig({
      stylelintrc: baseConfigPath,
    });
    expect(baseConfigNormalized).toMatchSnapshot();
  });

  it.each(Object.keys(extendedConfigUnprocessed.rules))(
    'should override rule: %s in the extendedConfigNormalized from baseConfigNormalized',
    async rule => {
      const extendedConfigNormalized = await getNormalizedConfig({
        stylelintrc: extendedConfigPath,
      });
      expect(extendedConfigNormalized.config.rules[rule]).toStrictEqual(
        extendedConfigUnprocessed.rules[
          rule as keyof typeof extendedConfigUnprocessed.rules
        ],
      );
    },
  );

  it.each(
    Object.keys(baseConfigUnprocessed.rules).filter(
      rule => !Object.keys(extendedConfigUnprocessed.rules).includes(rule),
    ),
  )(
    'should add rule %s from baseConfigNormalized to extendedConfigNormalized',
    async rule => {
      const extendedConfigNormalized = await getNormalizedConfig({
        stylelintrc: extendedConfigPath,
      });
      expect(extendedConfigNormalized.config.rules[rule]).toStrictEqual(
        baseConfigUnprocessed.rules[
          rule as keyof typeof baseConfigUnprocessed.rules
        ],
      );
    },
  );
});
