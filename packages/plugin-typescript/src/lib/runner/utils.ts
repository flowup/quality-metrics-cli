import {
  type Diagnostic,
  DiagnosticCategory,
  flattenDiagnosticMessageText,
} from 'typescript';
import type { Issue } from '@code-pushup/models';
import type { AuditSlug } from '../types.js';
import { TS_ERROR_CODES } from './ts-error-codes.js';

/** Build Reverse Lookup Map. It will a map with key as the error code and value as the audit slug. */
export const AUDIT_LOOKUP = Object.values(TS_ERROR_CODES)
  .flatMap(v => Object.entries(v))
  .reduce<Map<number, AuditSlug>>((lookup, [slug, codes]) => {
    codes.forEach(code => lookup.set(code, slug as AuditSlug));
    return lookup;
  }, new Map<number, AuditSlug>());

/**
 * Transform the TypeScript error code to the audit slug.
 * @param code - The TypeScript error code.
 * @returns The audit slug.
 * @throws Error if the code is not supported.
 */
export function transformTSErrorCodeToAuditSlug(code: number): AuditSlug {
  const knownCode = AUDIT_LOOKUP.get(code);
  if (knownCode === undefined) {
    throw new Error(`Code ${code} not supported.`);
  }
  return knownCode;
}

/**
 * Get the severity of the issue based on the TypeScript diagnostic category.
 * - ts.DiagnosticCategory.Warning (1)
 * - ts.DiagnosticCategory.Error (2)
 * - ts.DiagnosticCategory.Suggestion (3)
 * - ts.DiagnosticCategory.Message (4)
 * @param category - The TypeScript diagnostic category.
 * @returns The severity of the issue.
 */
export function getSeverity(category: DiagnosticCategory): Issue['severity'] {
  switch (category) {
    case DiagnosticCategory.Error:
      return 'error';
    case DiagnosticCategory.Warning:
      return 'warning';
    default:
      return 'info';
  }
}

/**
 * Get the issue from the TypeScript diagnostic.
 * @param diag - The TypeScript diagnostic.
 * @returns The issue.
 * @throws Error if the diagnostic is global (e.g., invalid compiler option).
 */
export function getIssueFromDiagnostic(
  diag: Diagnostic,
): Omit<Issue, 'source'> & { source: Required<NonNullable<Issue['source']>> } {
  const message = `${flattenDiagnosticMessageText(diag.messageText, '\n')}`;

  // If undefined, the error might be global (e.g., invalid compiler option).
  if (diag.file === undefined) {
    throw new Error(message);
  }

  const startLine =
    diag.start !== undefined
      ? diag.file.getLineAndCharacterOfPosition(diag.start).line + 1
      : 1;

  return {
    severity: getSeverity(diag.category),
    message,
    source: {
      file: diag.file.fileName,
      position: {
        startLine,
      },
    },
  };
}
