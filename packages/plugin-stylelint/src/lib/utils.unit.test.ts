import { type MockInstance, describe, expect, it } from 'vitest';
import type { NormalizedStyleLintConfig } from './runner/model.js';
import * as normalizeConfigModule from './runner/normalize-config.js';
import type { RcPath } from './types.js';
import {
  getAudits,
  getCategoryRefsFromAudits,
  getCategoryRefsFromGroups,
  getGroups,
  slugToAudit,
} from './utils.js';

const stylelintrc =
  'packages/plugin-stylelint/mocks/fixtures/css/.stylelintrc.color-no-invalid-hex.json';

describe('slugToAudit', () => {
  it('should convert slug to audit', () => {
    const slug = 'color-no-invalid-hex';
    const audit = slugToAudit(slug);
    expect(audit).toStrictEqual({
      slug,
      title: slug,
      docsUrl: `https://stylelint.io/user-guide/rules/${slug}`,
    });
  });
});

describe('getAudits', () => {
  let getNormalizedConfigSpy: MockInstance<
    [RcPath],
    Promise<NormalizedStyleLintConfig>
  >;

  beforeEach(() => {
    getNormalizedConfigSpy = vi
      .spyOn(normalizeConfigModule, 'getNormalizedConfig')
      .mockResolvedValue({
        config: {
          rules: {
            enabled1: true,
            enabled2: true,
            disabled1: null,
            disabled2: null,
          },
        },
      });
  });

  it('should call getNormalizedConfig with passed options', async () => {
    const options = { stylelintrc };

    await expect(getAudits(options)).resolves.not.toThrow();

    expect(getNormalizedConfigSpy).toHaveBeenCalledTimes(1);
    expect(getNormalizedConfigSpy).toHaveBeenCalledWith({ stylelintrc });
  });

  it('should turn enabled rules into audits', async () => {
    await expect(getAudits({ stylelintrc })).resolves.toStrictEqual([
      {
        docsUrl: 'https://stylelint.io/user-guide/rules/enabled1',
        slug: 'enabled1',
        title: 'enabled1',
      },
      {
        docsUrl: 'https://stylelint.io/user-guide/rules/enabled2',
        slug: 'enabled2',
        title: 'enabled2',
      },
    ]);
  });
});

describe('getGroups', () => {
  let getNormalizedConfigSpy: MockInstance<
    [RcPath],
    Promise<NormalizedStyleLintConfig>
  >;

  beforeEach(() => {
    getNormalizedConfigSpy = vi
      .spyOn(normalizeConfigModule, 'getNormalizedConfig')
      .mockResolvedValue({
        config: {
          rules: {
            error1: true,
            warning1: [true, { severity: 'warning' }],
          },
        },
      });
  });

  it('should return only enabled audits', async () => {
    getNormalizedConfigSpy = vi
      .spyOn(normalizeConfigModule, 'getNormalizedConfig')
      .mockResolvedValue({
        config: {
          rules: {
            error1: true,
            error2: true,
            error3: null,
            error4: null,
          },
        },
      });

    await expect(getGroups({ stylelintrc })).resolves.toStrictEqual([
      {
        refs: [
          {
            slug: 'error1',
            weight: 1,
          },
          {
            slug: 'error2',
            weight: 1,
          },
        ],
        slug: 'problems',
        title: 'Problems',
      },
    ]);
  });

  it('should return audits by groups based on the rules severity', async () => {
    getNormalizedConfigSpy = vi
      .spyOn(normalizeConfigModule, 'getNormalizedConfig')
      .mockResolvedValue({
        config: {
          rules: {
            error1: true,
            warning1: [true, { severity: 'warning' }],
          },
        },
      });

    await expect(getGroups({ stylelintrc })).resolves.toStrictEqual([
      {
        refs: [
          {
            slug: 'error1',
            weight: 1,
          },
        ],
        slug: 'problems',
        title: 'Problems',
      },
      {
        refs: [
          {
            slug: 'warning1',
            weight: 1,
          },
        ],
        slug: 'suggestions',
        title: 'Suggestions',
      },
    ]);
    expect(getNormalizedConfigSpy).toHaveBeenCalledTimes(1);
    expect(getNormalizedConfigSpy).toHaveBeenCalledWith({ stylelintrc });
  });
});

describe('getCategoryRefsFromGroups', () => {
  let getNormalizedConfigSpy: MockInstance<
    [RcPath],
    Promise<NormalizedStyleLintConfig>
  >;

  beforeEach(() => {
    getNormalizedConfigSpy = vi
      .spyOn(normalizeConfigModule, 'getNormalizedConfig')
      .mockResolvedValue({
        config: {
          rules: {
            error1: true,
            warning1: [true, { severity: 'warning' }],
          },
        },
      });
  });

  it('should return category refs from groups', async () => {
    await expect(
      getCategoryRefsFromGroups({ stylelintrc }),
    ).resolves.toStrictEqual([
      {
        plugin: 'stylelint',
        slug: 'problems',
        type: 'group',
        weight: 1,
      },
      {
        plugin: 'stylelint',
        slug: 'suggestions',
        type: 'group',
        weight: 1,
      },
    ]);
    expect(getNormalizedConfigSpy).toHaveBeenCalledTimes(1);
    expect(getNormalizedConfigSpy).toHaveBeenCalledWith({ stylelintrc });
  });
});

describe('getCategoryRefsFromAudits', () => {
  let getNormalizedConfigSpy: MockInstance<
    [RcPath],
    Promise<NormalizedStyleLintConfig>
  >;

  beforeEach(() => {
    getNormalizedConfigSpy = vi
      .spyOn(normalizeConfigModule, 'getNormalizedConfig')
      .mockResolvedValue({
        config: {
          rules: {
            error1: true,
            warning1: [true, { severity: 'warning' }],
          },
        },
      });
  });

  it('should return category refs from audits', async () => {
    await expect(
      getCategoryRefsFromAudits({ stylelintrc }),
    ).resolves.toStrictEqual([
      {
        plugin: 'stylelint',
        slug: 'error1',
        type: 'audit',
        weight: 1,
      },
      {
        plugin: 'stylelint',
        slug: 'warning1',
        type: 'audit',
        weight: 1,
      },
    ]);
    expect(getNormalizedConfigSpy).toHaveBeenCalledTimes(1);
    expect(getNormalizedConfigSpy).toHaveBeenCalledWith({ stylelintrc });
  });
});
