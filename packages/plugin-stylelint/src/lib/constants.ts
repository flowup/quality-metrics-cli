import type { CategoryConfig, Group } from '@code-pushup/models';

export const STYLELINT_PLUGIN_SLUG = 'stylelint' as const;
export const DEFAULT_STYLELINTRC = '.stylelintrc.json' as const;

export const GROUPS = [
  {
    slug: 'problems' as const,
    title: 'Problems',
    refs: [],
  },
  {
    slug: 'suggestions' as const,
    title: 'Suggestions',
    refs: [],
  },
] satisfies Group[];

export const CATEGORY_MAP: Record<string, CategoryConfig> = {
  'code-style': {
    slug: 'code-style' as const,
    title: 'Code Style',
    refs: [
      {
        slug: 'suggestions',
        weight: 1,
        type: 'group',
        plugin: 'stylelint',
      },
    ],
  },
  'bug-prevention': {
    slug: 'bug-prevention' as const,
    title: 'Bug Prevention',
    refs: [
      {
        slug: 'problems',
        weight: 1,
        type: 'group',
        plugin: 'stylelint',
      },
    ],
  },
};
