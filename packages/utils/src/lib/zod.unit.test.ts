import { describe, expect, it } from 'vitest';
import { ZodError, ZodIssue, z } from 'zod';
import {
  ISSUE_SEPARATOR,
  UNION_SEPARATOR,
  getMessageFromZodIssue,
  joinPath,
} from './zod';

describe('joinPath', () => {
  it('should join path array to readable string', () => {
    const result = joinPath(['plugins', 1, 'groups', 0, 'refs', 0, 'weight']);
    expect(result).toBe('plugins[1].groups[0].refs[0].weight');
  });

  it('should join path array of nested properties', () => {
    const result = joinPath(['audits', 'largest-contentful-paint', 'refs']);
    expect(result).toBe('audits.largest-contentful-paint.refs');
  });

  it('should join path array of nested array', () => {
    const result = joinPath([0, 1, 2, 3]);
    expect(result).toBe('[0][1][2][3]');
  });

  it('should join path array of quoted properties', () => {
    const result = joinPath(['first"name']);
    expect(result).toBe('first"name');
  });

  it('should join path array of special charts', () => {
    const result = joinPath(['$special', '_name']);
    expect(result).toBe('$special._name');
  });

  it('should join path array containing brackets and quotes', () => {
    const result = joinPath(['"complex[key]"']);
    expect(result).toBe('"complex[key]"');
  });

  it('should join path array of Emoji identifiers', () => {
    const result = joinPath(['😀']);
    expect(result).toBe('😀');
  });
});

describe('getMessageFromZodIssue', () => {
  it('should get message string from zod issue', () => {
    const model = z.string();
    const { error: issue } = model.safeParse(undefined) as unknown as {
      error: ZodIssue;
    };
    expect(
      getMessageFromZodIssue({
        issue,
        issueSeparator: ISSUE_SEPARATOR,
        unionSeparator: UNION_SEPARATOR,
        includePath: true,
      }),
    ).toBe('');
  });
});
