import {
  type Diagnostic,
  DiagnosticCategory,
  flattenDiagnosticMessageText,
} from 'typescript';
import type { Issue } from '@code-pushup/models';
import { SUPPORTED_TS_ERROR_CODES } from '../constants.js';

export function transformTSErrorCodeToAuditSlug(tscode: number) {
  return (
    SUPPORTED_TS_ERROR_CODES[tscode as keyof typeof SUPPORTED_TS_ERROR_CODES] ||
    codeToAuditSlug(tscode)
  );
}

export function codeToAuditSlug(tscode: number) {
  return `ts-code-${tscode.toString()}`;
}

/**
 *  ts.DiagnosticCategory.Warning (1)
 *   ts.DiagnosticCategory.Error (2)
 *   ts.DiagnosticCategory.Suggestion (3)
 *   ts.DiagnosticCategory.Message (4)
 */
export function getSeverity(category: DiagnosticCategory): Issue['severity'] {
  switch (category) {
    case DiagnosticCategory.Error:
      return 'error';
    case DiagnosticCategory.Warning:
      return 'warning';
    case DiagnosticCategory.Suggestion:
    case DiagnosticCategory.Message:
    default:
      return 'info';
  }
}

export function getIssueFromDiagnostic(diag: Diagnostic): Issue {
  const message = `${flattenDiagnosticMessageText(diag.messageText, '\n')}`;
  const file = diag.file?.fileName;

  //   If undefined, the error might be global (e.g., invalid compiler option).
  if (file === undefined) {
    throw new Error(message);
  }

  const line =
    diag.file && diag.start !== undefined
      ? diag.file.getLineAndCharacterOfPosition(diag.start).line + 1
      : 0;

  return {
    severity: getSeverity(diag.category),
    message,
    source: {
      file,
      position: {
        startLine: line,
      },
    },
  };
}
