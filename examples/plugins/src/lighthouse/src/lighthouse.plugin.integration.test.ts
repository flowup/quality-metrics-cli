import { vol } from 'memfs';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  auditSchema,
  categoryRefSchema,
  pluginConfigSchema,
} from '@code-pushup/models';
import { MEMFS_VOLUME } from '@code-pushup/test-utils';
import { LIGHTHOUSE_URL } from '../mock/constants';
import { lhr } from '../mock/fixtures/lhr';
import { LIGHTHOUSE_OUTPUT_FILE_DEFAULT, corePerfGroupRefs } from './constants';
import { audits, PLUGIN_SLUG as slug } from './index';
import { create } from './lighthouse.plugin';

describe('lighthouse-create-export-config', () => {
  it('should return valid PluginConfig if create is called', async () => {
    const pluginConfig = await create({ url: LIGHTHOUSE_URL });
    expect(() => pluginConfigSchema.parse(pluginConfig)).not.toThrow();
    expect(pluginConfig).toEqual({
      slug,
      title: 'Lighthouse',
      description: 'Chrome lighthouse CLI as code-pushup plugin',
      icon: 'lighthouse',
      runner: expect.any(Object),
      audits,
      groups: expect.any(Array),
    });
  });

  it('should parse options for defaults correctly in runner args', async () => {
    const pluginConfig = await create({
      url: 'https://code-pushup.com',
    });
    expect(pluginConfig.runner.args).toEqual([
      'lighthouse',
      'https://code-pushup.com',
      '--no-verbose',
      '--output="json"',
      `--output-path="lighthouse-report.json"`,
      '--onlyAudits="first-contentful-paint"',
      '--onlyAudits="largest-contentful-paint"',
      '--onlyAudits="speed-index"',
      '--onlyAudits="total-blocking-time"',
      '--onlyAudits="cumulative-layout-shift"',
      '--onlyAudits="server-response-time"',
      '--onlyAudits="interactive"',
      '--chrome-flags="--headless=new"',
    ]);
  });

  it('should parse options for headless by default to "new" in runner args', async () => {
    const pluginConfig = await create({
      url: LIGHTHOUSE_URL,
    });
    expect(pluginConfig.runner.args).toEqual(
      expect.arrayContaining(['--chrome-flags="--headless=new"']),
    );
  });

  it('should parse options for headless to new if true is given in runner args', async () => {
    const pluginConfig = await create({
      url: LIGHTHOUSE_URL,
      headless: true,
    });
    expect(pluginConfig.runner.args).toEqual(
      expect.arrayContaining(['--chrome-flags="--headless=new"']),
    );
  });

  it('should parse options for headless to new if false is given in runner args', async () => {
    const pluginConfig = await create({
      url: LIGHTHOUSE_URL,
      headless: false,
    });
    expect(pluginConfig.runner.args).toEqual(
      expect.not.arrayContaining(['--chrome-flags="--headless=new"']),
    );
  });

  it('should override userDataDir option when given in runner args', async () => {
    const pluginConfig = await create({
      url: LIGHTHOUSE_URL,
      userDataDir: 'test',
    });
    expect(pluginConfig.runner.args).toEqual(
      expect.arrayContaining([
        '--chrome-flags="--headless=new --user-data-dir=test"',
      ]),
    );
  });
});

describe('lighthouse-create-export-execution', () => {
  beforeEach(() => {
    vol.fromJSON(
      {
        [LIGHTHOUSE_OUTPUT_FILE_DEFAULT]: JSON.stringify(lhr),
      },
      MEMFS_VOLUME,
    );
  });
});

describe('lighthouse-audits-export', () => {
  it.each(audits.map(a => [a.slug, a]))(
    'should have a valid audit meta info for %s',
    (_, audit) => {
      expect(() => auditSchema.parse(audit)).not.toThrow();
    },
  );
});

describe('lighthouse-corePerfGroupRefs-export', () => {
  it.each(corePerfGroupRefs.map(g => [g.slug, g]))(
    'should be a valid category reference for %s',
    (_, categoryRef) => {
      expect(() => categoryRefSchema.parse(categoryRef)).not.toThrow();
    },
  );
});
