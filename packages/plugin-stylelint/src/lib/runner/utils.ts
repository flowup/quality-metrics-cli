import type { LintResult, Secondary, Severity, Warning } from 'stylelint';
import type {
  Audit,
  AuditOutputs,
  AuditReport,
  Issue,
} from '@code-pushup/models';
import type { ActiveConfigRuleSetting } from './model.js';

export function mapStylelintResultsToAudits(
  results: LintResult[],
  expectedAudits: Audit[],
): AuditOutputs {
  // Create an immutable Map of audits from the expected audits
  const initialAuditMap = expectedAudits.reduce((map, audit) => {
    map.set(audit.slug, {
      ...audit,
      score: 1, // Default score
      value: 0, // Default value
      details: { issues: [] },
    });
    return map;
  }, new Map<string, AuditReport>());

  // Process results and produce a new immutable audit map
  const finalAuditMap = results.reduce((map, result) => {
    const { source, warnings } = result;

    if (!source) {
      throw new Error('Stylelint source can`t be undefined');
    }

    return warnings.reduce((innerMap, warning) => {
      const { rule, line, text } = warning;

      const existingAudit = innerMap.get(rule);
      if (!existingAudit) return innerMap;

      // Create a new audit object with updated details
      const updatedAudit: AuditReport = {
        ...existingAudit,
        score: 0, // Indicate at least one issue exists
        value: existingAudit.value + 1,
        details: {
          issues: [
            ...(existingAudit?.details?.issues ?? []),
            {
              severity: getSeverityFromWarning(warning),
              message: text,
              source: {
                file: source,
                position: { startLine: line },
              },
            },
          ],
        },
      };

      // Return a new map with the updated audit
      return new Map(innerMap).set(rule, updatedAudit);
    }, map);
  }, initialAuditMap);

  // Return the updated audits as an array
  return Array.from(finalAuditMap.values());
}

/**
 * Processes warnings and updates the audit map using reduce.
 *
 * @param auditMap - Current map of audits
 * @param warnings - Array of Stylelint warnings
 * @param source - The source file associated with the warnings
 */
function processWarnings(
  auditMap: Map<string, AuditReport>,
  warnings: LintResult['warnings'],
  source: string,
): Map<string, AuditReport> {
  return warnings.reduce((innerMap, warning) => {
    const { rule, line, text } = warning;

    const existingAudit = innerMap.get(rule);
    if (!existingAudit) {
      return innerMap;
    }

    const updatedAudit: AuditReport = {
      ...existingAudit,
      score: 0, // At least one issue exists
      value: existingAudit.value + 1,
      details: {
        issues: [
          ...(existingAudit.details?.issues ?? []),
          {
            severity: getSeverityFromWarning(warning),
            message: text,
            source: {
              file: source,
              position: { startLine: line },
            },
          },
        ],
      },
    };

    return innerMap.set(rule, updatedAudit);
  }, auditMap);
}

export function getSeverityFromWarning(warning: Warning): 'error' | 'warning' {
  const { severity } = warning;

  if (severity === 'error' || severity === 'warning') {
    return severity;
  }
  throw new Error(`Unknown severity: ${severity}`);
}

/**
 * Function that returns the severity from a ruleConfig.
 * If the ruleConfig is not an array, the default severity of the config file must be returned, since the custom severity can be only specified in an array.
 * If the ruleConfig is an array, a custom severity might have been set, in that case, it must be returned
 * @param ruleConfig - The Stylelint rule config value
 * @param defaultSeverity - The default severity of the config file. By default, it's 'error'
 * @returns The severity (EX: 'error' | 'warning')
 */
export function getSeverityFromRuleConfig(
  ruleConfig: ActiveConfigRuleSetting,
  defaultSeverity: Severity = 'error',
): Severity {
  //If it's not an array, the default severity of the config file must be returned, since the custom severity can be only specified in an array.
  if (!Array.isArray(ruleConfig)) {
    return defaultSeverity;
  }

  // If it's an array, a custom severity might have been set, in that case, it must be returned

  const secondary: Secondary = ruleConfig.at(1);

  if (secondary == null) {
    return defaultSeverity;
  }

  if (!secondary['severity']) {
    return defaultSeverity;
  }

  if (typeof secondary['severity'] === 'function') {
    console.warn('Function severity is not supported');
    return defaultSeverity;
  }

  return secondary['severity'];
}

export function parseErrorsToIssues(
  parseErrors: LintResult['parseErrors'],
  filePath: string,
): Issue[] {
  return parseErrors.map(error => ({
    severity: 'error',
    message: error.text,
    source: {
      file: filePath,
      position: {
        startLine: error.line,
        startColumn: error.column,
      },
    },
  }));
}

export function getLineForConfigIssue(
  fileContent: string,
  warningText: string,
): number | undefined {
  // Extract rule name and invalid value from warning text
  const ruleMatch = /rule "([^"]+)"/.exec(warningText);
  const valueMatch = /value "(.*?)"/.exec(warningText);

  const ruleName = ruleMatch ? ruleMatch[1] : undefined;
  const invalidValue = valueMatch ? valueMatch[1] : undefined;

  if (!ruleName || !invalidValue) {
    return undefined; // If either is missing, return undefined
  }

  // Create a regex to match the line in the configuration
  const regex = new RegExp(`"${ruleName}"\\s*:\\s*.*?${invalidValue}`, 'g');
  const lines = fileContent.split('\n');

  // Find the matching line
  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) {
      return i + 1; // Line numbers are 1-based
    }
  }
  return undefined; // Return undefined if no match is found
}

export function invalidOptionWarningsToIssues(
  invalidOptionWarnings: LintResult['invalidOptionWarnings'],
  filePath: string,
  fileContent: string,
): Issue[] {
  return invalidOptionWarnings.map(warning => {
    const line = getLineForConfigIssue(fileContent, warning.text);

    return {
      severity: 'error',
      message: warning.text,
      source: {
        file: filePath,
        position: {
          startLine: line ?? 1, // Use detected line or fallback to 1
        },
      },
    };
  });
}

function getLineForConfigIssueForDeprecations(
  fileContent: string,
  warningText: string,
): number | undefined {
  // Extract the deprecated rule name from the warning text
  const ruleMatch = /rule "([^"]+)"/.exec(warningText);
  const ruleName = ruleMatch ? ruleMatch[1] : undefined;

  if (!ruleName) {
    return undefined; // Return undefined if the rule name cannot be extracted
  }

  // Create a regex to match the rule name in the configuration
  const regex = new RegExp(`"${ruleName}"\\s*:`, 'g');
  const lines = fileContent.split('\n');

  // Find the matching line
  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) {
      return i + 1; // Line numbers are 1-based
    }
  }
  return undefined; // Return undefined if no match is found
}

export function deprecationsToIssues(
  deprecations: LintResult['deprecations'],
  filePath: string,
  fileContent: string,
): Issue[] {
  return deprecations.map(deprecation => {
    const line = getLineForConfigIssueForDeprecations(
      fileContent,
      deprecation.text,
    );

    return {
      severity: 'warning', // Deprecations are less critical but need attention
      message: `${deprecation.text}${deprecation.reference ? ` (See: ${deprecation.reference})` : ''}`,
      source: {
        file: filePath,
        position: {
          startLine: line ?? 1, // Use detected line or fallback to 1
        },
      },
    };
  });
}
