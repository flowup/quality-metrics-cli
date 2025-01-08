import type { ConfigRuleSettings } from 'stylelint';
import type { Audit, CategoryRef } from '@code-pushup/models';
import {
  DEFAULT_STYLELINTRC,
  GROUPS,
  STYLELINT_PLUGIN_SLUG,
} from './constants.js';
import type { ActiveConfigRuleSetting } from './runner/model.js';
import { getNormalizedConfig } from './runner/normalize-config.js';
import { getSeverityFromRuleConfig } from './runner/utils.js';
import type { RcPath } from './types.js';

// @TODO check if we can get meta data to enrich audits
export function slugToAudit(slug: string): Audit {
  return {
    slug,
    title: slug,
    docsUrl: `https://stylelint.io/user-guide/rules/${slug}`,
  };
}

export async function getAudits(options: RcPath): Promise<Audit[]> {
  const { config } = await getNormalizedConfig(options);
  return Object.entries(config.rules)
    .filter(filterNullRules)
    .map(([ruleName]) => slugToAudit(ruleName));
}

export async function getGroups(options: RcPath) {
  const { config } = await getNormalizedConfig(options);
  const { rules, defaultSeverity } = config;
  return GROUPS.map(group => ({
    ...group,
    refs: Object.entries(rules)
      .filter(filterNullRules)
      // filter rules by severity and group
      .filter(([_, ruleConfig]) => {
        const severity = getSeverityFromRuleConfig(
          ruleConfig as ActiveConfigRuleSetting,
          defaultSeverity,
        );
        return (
          (severity === 'error' && group.slug === 'problems') ||
          (severity === 'warning' && group.slug === 'suggestions')
        );
      })
      .map(([rule]) => ({ slug: rule, weight: 1 })),
  })).filter(group => group.refs.length > 0);
}

function filterNullRules<T, O extends object = object>(
  setting: [unknown, ConfigRuleSettings<T, O>],
): setting is [unknown, Exclude<ConfigRuleSettings<T, O>, null | undefined>] {
  return setting[1] != null;
}

export async function getCategoryRefsFromGroups(
  opt?: RcPath,
): Promise<CategoryRef[]> {
  const { stylelintrc = DEFAULT_STYLELINTRC } = opt ?? {};
  const groups = await getGroups({ stylelintrc });
  return groups.map(({ slug }) => ({
    plugin: STYLELINT_PLUGIN_SLUG,
    slug,
    weight: 1,
    type: 'group',
  }));
}

export async function getCategoryRefsFromAudits(
  opt?: RcPath,
): Promise<CategoryRef[]> {
  const { stylelintrc = DEFAULT_STYLELINTRC } = opt ?? {};
  const audits = await getAudits({ stylelintrc });
  return audits.map(({ slug }) => ({
    plugin: STYLELINT_PLUGIN_SLUG,
    slug,
    weight: 1,
    type: 'audit',
  }));
}
