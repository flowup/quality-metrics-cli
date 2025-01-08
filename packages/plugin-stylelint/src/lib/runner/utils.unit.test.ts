import type { LintResult, Severity } from 'stylelint';
import { describe, expect, it } from 'vitest';
import type { Audit } from '@code-pushup/models';
import type { ActiveConfigRuleSetting } from './model.js';
import {
  getSeverityFromRuleConfig,
  stylelintResultsToAuditOutputs,
} from './utils.js';

describe('stylelintResultsToAuditOutputs', () => {
  const colorNoInvalidHexWarning = {
    column: 10,
    endColumn: 13,
    endLine: 3,
    line: 3,
    rule: 'color-no-invalid-hex',
    severity: 'error' as Severity,
    text: `Unexpected invalid hex color "#34"`,
    url: undefined,
  };

  const mockResult: LintResult = {
    source: 'test.css',
    deprecations: [],
    invalidOptionWarnings: [],
    parseErrors: [],
    errored: false,
    warnings: [colorNoInvalidHexWarning],
    ignored: false,
  };

  const mockExpectedAudits: Audit[] = [
    {
      slug: 'color-no-invalid-hex',
      title: 'color-no-invalid-hex',
      description: 'A test rule for unit testing',
      docsUrl: 'https://stylelint.io/rules/color-no-invalid-hex',
    },
  ];

  it('should throw if source is undefined', () => {
    const result = { ...mockResult, source: undefined };
    expect(() =>
      stylelintResultsToAuditOutputs([result], mockExpectedAudits),
    ).toThrow('Stylelint source can`t be undefined');
  });

  it('should turn warnings into AuditOutputs', () => {
    const audits = stylelintResultsToAuditOutputs(
      [mockResult],
      mockExpectedAudits,
    );
    expect(audits).toStrictEqual([
      expect.objectContaining({
        ...mockExpectedAudits.at(0),
      }),
    ]);
  });

  it('should take audits name from rule name', () => {
    const audits = stylelintResultsToAuditOutputs(
      [mockResult],
      mockExpectedAudits,
    );
    expect(audits[0]!.slug).toBe(mockResult.warnings[0]!.rule);
  });

  it('should have number oflint warnings as value', () => {
    const audits = stylelintResultsToAuditOutputs(
      [mockResult, mockResult],
      mockExpectedAudits,
    );
    expect(audits).toStrictEqual([
      expect.objectContaining({
        value: 2,
      }),
    ]);
  });

  it('should have a score of 1 if there was no warnings', () => {
    const audits = stylelintResultsToAuditOutputs([], mockExpectedAudits);
    expect(audits).toStrictEqual([
      expect.objectContaining({
        score: 1,
      }),
    ]);
  });

  it('should have a score of 0 if there was warnings', () => {
    const audits = stylelintResultsToAuditOutputs(
      [mockResult],
      mockExpectedAudits,
    );
    expect(audits).toStrictEqual([
      expect.objectContaining({
        score: 0,
      }),
    ]);
  });
});

describe('getSeverityFromRuleConfig', () => {
  it('should respect the default severity when from the default', () => {
    expect(getSeverityFromRuleConfig([true])).toBe('error');
  });

  it('should consider the default severity when its different from the default', () => {
    expect(getSeverityFromRuleConfig([true], 'warning')).toBe('warning');
  });

  it.each([true, 5, 'percentage', ['/\\[.+]/', 'percentage'], { a: 1 }])(
    'should return the default severity for a primary value %s',
    ruleConfig => {
      expect(
        getSeverityFromRuleConfig(ruleConfig as ActiveConfigRuleSetting),
      ).toBe('error');
    },
  );

  it('should return the default severity when the rule config does not have a secondary item', () => {
    expect(getSeverityFromRuleConfig([true])).toBe('error');
  });

  it('should return the default severity when the secondary item is missing the `severity` property', () => {
    expect(getSeverityFromRuleConfig([true, {}])).toBe('error');
  });

  it('should return the default severity when `severity` property is of type function', () => {
    expect(getSeverityFromRuleConfig([true, { severity: () => {} }])).toBe(
      'error',
    );
  });

  it.each([
    { ruleConfig: [true, { severity: 'warning' }], expected: 'warning' },
    { ruleConfig: [true, { severity: 'error' }], expected: 'error' },
  ])('should return the set severity `%s`', ({ ruleConfig, expected }) => {
    expect(getSeverityFromRuleConfig(ruleConfig)).toBe(expected);
  });

  it.each([null, undefined])(
    'should return the default severity for disabled rules %s',
    ruleConfig => {
      expect(
        getSeverityFromRuleConfig(
          ruleConfig as unknown as ActiveConfigRuleSetting,
        ),
      ).toBe('error');
    },
  );
});
