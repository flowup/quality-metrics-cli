import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getNormalizedConfig } from './normalize-config.js';

describe('getNormalizedConfigForFile', () => {
  it('should load config from specified configFile and respect the value of specifically set rules', async () => {
    const stylelintrc = path.join(
      process.cwd(),
      'packages/plugin-stylelint/mocks/fixtures/css/.stylelintrc.basic.json',
    );

    const parsed = await getNormalizedConfig({ stylelintrc });

    expect(parsed.config.rules['block-no-empty']).toStrictEqual([
      'impossibleValue',
    ]); // The default value is [ true ], so having the not even valid value from the config file is correct
  });

  it('should load config from specified configFile and add default rules', async () => {
    const stylelintrc = path.join(
      process.cwd(),
      'packages/plugin-stylelint/mocks/fixtures/css/.stylelintrc.basic.json',
    );

    const parsed = await getNormalizedConfig({ stylelintrc });
    expect(Object.keys(parsed.config.rules).length).toBeGreaterThan(1);
  });
});
