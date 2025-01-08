import { describe, expect, it } from 'vitest';
import * as normalizeConfigModule from './runner/normalize-config.js';
import { getAudits, getGroups, slugToAudit } from './utils.js';

// The options must be provided for types, internally the normalized config is mocked
const options = { stylelintrc: 'mock/path/to/.stylelintrc.json' };

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
  beforeEach(() => {
    vi.spyOn(normalizeConfigModule, 'getNormalizedConfig').mockResolvedValue({
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
    await expect(getAudits(options)).resolves.not.toThrow();
  });

  it('should turn enabled rules into audits', async () => {
    await expect(getAudits(options)).resolves.toStrictEqual([
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
  it('should return only enabled audits', async () => {
    vi.spyOn(normalizeConfigModule, 'getNormalizedConfig').mockResolvedValue({
      config: {
        rules: {
          error1: true,
          error2: true,
          error3: null,
          error4: null,
        },
      },
    });

    await expect(getGroups(options)).resolves.toStrictEqual([
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
    vi.spyOn(normalizeConfigModule, 'getNormalizedConfig').mockResolvedValue({
      config: {
        rules: {
          error1: true,
          warning1: [true, { severity: 'warning' }],
        },
      },
    });

    await expect(getGroups(options)).resolves.toStrictEqual([
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
  });
});
