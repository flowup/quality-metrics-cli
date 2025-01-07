import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { NormalizedStyleLintConfig } from './model.js';
import { getNormalizedConfig } from './normalize-config.js';

const configPath = path.join(
  process.cwd(),
  'packages/plugin-stylelint/mocks/fixtures/stylelint-config/.stylelintrc.json',
);

const baseConfigPath = path.join(
  process.cwd(),
  'packages/plugin-stylelint/mocks/fixtures/stylelint-config/index.js',
);

describe('getNormalizedConfig', () => {
  let extendedConfig: NormalizedStyleLintConfig;
  let baseConfig: NormalizedStyleLintConfig;

  beforeAll(async () => {
    extendedConfig = await getNormalizedConfig({ stylelintrc: configPath });
    baseConfig = await getNormalizedConfig({ stylelintrc: baseConfigPath });
  });

  it('should get config from specified JSON file', async () => {
    expect(extendedConfig).toMatchSnapshot();
  });

  it('should get config from specified JS file', async () => {
    expect(baseConfig).toMatchSnapshot();
  });

  it('should override values specified in config file from the extended base config', async () => {
    expect(extendedConfig.config.rules['block-no-empty']).toBeNull();
    expect(baseConfig.config.rules['block-no-empty']).toStrictEqual([
      true,
      { severity: 'error' },
    ]);

    expect(extendedConfig.config.rules['color-no-invalid-hex']).toBeTruthy();
    expect(baseConfig.config.rules['color-no-invalid-hex']).toStrictEqual([
      true,
      { severity: 'error' },
    ]);
  });

  it('should have the same amount of rules as the base config', async () => {
    expect(Object.keys(extendedConfig.config.rules)).toHaveLength(
      Object.keys(baseConfig.config.rules).length,
    );
  });
});
