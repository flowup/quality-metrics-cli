import { beforeEach, describe, expect } from 'vitest';
import { CategoryConfig, CoreConfig } from '@code-pushup/models';
import { ui } from '@code-pushup/utils';
import {
  filterCategoryByPluginSlug,
  filterPluginsBySlug,
  validateOnlyPluginsOption,
} from './only-plugins.utils';

describe('filterPluginsBySlug', () => {
  it('should return all plugins if no onlyPlugins option is provided', () => {
    expect(
      filterPluginsBySlug(
        [
          { slug: 'plugin1' },
          { slug: 'plugin2' },
          { slug: 'plugin3' },
        ] as CoreConfig['plugins'],
        {},
      ),
    ).toEqual([{ slug: 'plugin1' }, { slug: 'plugin2' }, { slug: 'plugin3' }]);
  });

  it('should return only plugins with matching slugs', () => {
    expect(
      filterPluginsBySlug(
        [
          { slug: 'plugin1' },
          { slug: 'plugin2' },
          { slug: 'plugin3' },
        ] as CoreConfig['plugins'],
        { onlyPlugins: ['plugin1', 'plugin3'] },
      ),
    ).toEqual([{ slug: 'plugin1' }, { slug: 'plugin3' }]);
  });
});

describe('filterCategoryByPluginSlug', () => {
  beforeEach(() => {
    ui().logger.flushLogs();
  });
  it('should return all categories if no onlyPlugins option', () => {
    expect(
      filterCategoryByPluginSlug(
        [
          {
            refs: [{ plugin: 'plugin1' }, { plugin: 'plugin2' }],
          },
          { refs: [{ plugin: 'plugin3' }] },
        ] as CategoryConfig[],
        {},
      ),
    ).toEqual([
      {
        refs: [{ plugin: 'plugin1' }, { plugin: 'plugin2' }],
      },
      { refs: [{ plugin: 'plugin3' }] },
    ]);
  });

  it('should return categories containing only defined plugins', () => {
    expect(
      filterCategoryByPluginSlug(
        [
          {
            refs: [{ plugin: 'plugin1' }, { plugin: 'plugin2' }],
          },
          { refs: [{ plugin: 'plugin3' }] },
        ] as CategoryConfig[],
        { onlyPlugins: ['plugin1', 'plugin3'] },
      ),
    ).toEqual([{ refs: [{ plugin: 'plugin3' }] }]);
  });

  it('should print ignored category and its first violating plugin', () => {
    filterCategoryByPluginSlug(
      [
        {
          title: 'category1',
          refs: [
            { plugin: 'plugin1' },
            { plugin: 'plugin2' },
            { plugin: 'plugin4' },
          ],
        },
        { title: 'category2', refs: [{ plugin: 'plugin3' }] },
      ] as CategoryConfig[],
      {
        onlyPlugins: ['plugin1', 'plugin3'],
        verbose: true,
      },
    );
    const logs = ui()
      .logger.getRenderer()
      .getLogs()
      .map(({ message }) => message);
    expect(logs[0]).toEqual(
      expect.stringContaining('Category "category1" is ignored'),
    );
    expect(logs[0]).toEqual(
      expect.stringContaining('skipped plugin "plugin2"'),
    );
  });

  it('should return empty array for no categories', () => {
    expect(
      filterCategoryByPluginSlug([], { onlyPlugins: ['plugin1'] }),
    ).toEqual([]);
  });
});

describe('validateOnlyPluginsOption', () => {
  beforeEach(() => {
    ui().logger.flushLogs();
  });
  it('should warn if onlyPlugins option contains non-existing plugin', () => {
    validateOnlyPluginsOption(
      [{ slug: 'plugin1' }, { slug: 'plugin2' }] as CoreConfig['plugins'],
      {
        onlyPlugins: ['plugin1', 'plugin3', 'plugin4'],
        verbose: true,
      },
    );
    const logs = ui()
      .logger.getRenderer()
      .getLogs()
      .map(({ message }) => message);
    expect(logs[0]).toEqual(
      expect.stringContaining(
        'The --onlyPlugin argument references plugins with "plugin3", "plugin4" slugs',
      ),
    );
  });

  it('should not log if onlyPlugins option contains only existing plugins', () => {
    validateOnlyPluginsOption(
      [{ slug: 'plugin1' }, { slug: 'plugin2' }] as CoreConfig['plugins'],
      {
        onlyPlugins: ['plugin1'],
        verbose: true,
      },
    );
    const logs = ui()
      .logger.getRenderer()
      .getLogs()
      .map(({ message }) => message);
    expect(logs).toHaveLength(0);
  });
});
