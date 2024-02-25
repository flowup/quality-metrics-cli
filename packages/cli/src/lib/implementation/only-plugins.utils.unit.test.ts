import {describe, expect} from 'vitest';
import {PluginConfig} from '@code-pushup/models';
import {validateOnlyPluginsOption} from './only-plugins.utils';

describe('validateOnlyPluginsOption', () => {
  it('should warn if onlyPlugins option contains non-existing plugin', () => {
    validateOnlyPluginsOption(
      [
        {
          slug: 'plugin1',
          title: 'Plugin1',
          icon: 'git',
          audits: [
            {
              slug: 'a1',
              title: 'A 1',
            },
          ],
          runner: () => [{ value: 1, score: 1, slug: 'a1' }],
        },
      ] satisfies PluginConfig[],
      {
        onlyPlugins: ['plugin1', 'plugin3', 'plugin4'],
        verbose: true,
      },
    );
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'plugins with "plugin3", "plugin4" slugs, but no such plugins are present',
      ),
    );
  });

  it('should not log if onlyPlugins option contains only existing plugins', () => {
    validateOnlyPluginsOption(
      [
        {
          slug: 'plugin1',
          title: 'Plugin1',
          icon: 'git',
          audits: [
            {
              slug: 'a1-p1',
              title: 'A 1 P 1',
            },
          ],
          runner: () => [{ value: 1, score: 1, slug: 'a1-p1' }],
        },
        {
          slug: 'plugin2',
          title: 'Plugin2',
          icon: 'git',
          audits: [
            {
              slug: 'a1-p2',
              title: 'A 1 P 2',
            },
          ],
          runner: () => [{ value: 1, score: 1, slug: 'a1-p2' }],
        },
      ] as PluginConfig[],
      {
        onlyPlugins: ['plugin1'],
        verbose: true,
      },
    );
    expect(console.warn).not.toHaveBeenCalled();
  });
});

