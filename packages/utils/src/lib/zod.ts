import {ZodIssue} from "zod";
import {bold} from "ansis";

export const ISSUE_SEPARATOR = '; ';
export const MAX_ISSUES_IN_MESSAGE = 99;
export const PREFIX = 'Validation error';
export const PREFIX_SEPARATOR = ': ';
export const UNION_SEPARATOR = ', or ';

export function getMessageFromZodIssue(props: {
  issue: ZodIssue;
  issueSeparator: string;
  unionSeparator: string;
  includePath: boolean;
}): string {
  const { issue, issueSeparator, unionSeparator, includePath } = props;

  if (issue.code === 'invalid_union') {
    return issue.unionErrors
      .reduce<string[]>((acc, zodError) => {
        const newIssues = zodError.issues
          .map((issue) =>
            getMessageFromZodIssue({
              issue,
              issueSeparator,
              unionSeparator,
              includePath,
            })
          )
          .join(issueSeparator);

        if (!acc.includes(newIssues)) {
          acc.push(newIssues);
        }

        return acc;
      }, [])
      .join(unionSeparator);
  }

  if (issue.code === 'invalid_arguments') {
    return [
      issue.message,
      ...issue.argumentsError.issues.map(issue =>
        getMessageFromZodIssue({
          issue,
          issueSeparator,
          unionSeparator,
          includePath,
        }),
      ),
    ].join(issueSeparator);
  }

  if (issue.code === 'invalid_return_type') {
    return [
      issue.message,
      ...issue.returnTypeError.issues.map(issue =>
        getMessageFromZodIssue({
          issue,
          issueSeparator,
          unionSeparator,
          includePath,
        }),
      ),
    ].join(issueSeparator);
  }

  if (includePath && isNonEmptyArray(issue?.path)) {
    // handle array indices
    if (issue.path.length === 1) {
      const identifier = issue.path[0];

      if (typeof identifier === 'number') {
        return `${issue.message} at index ${identifier}`;
      }
    }

    return `${bold(joinPath(issue.path))}: ${issue.message}`;
  }

  return issue.message;
}

export type NonEmptyArray<T> = [T, ...T[]];

export function isNonEmptyArray<T>(value?: T[]): value is NonEmptyArray<T> {
  return value == null ? false : value.length > 0;
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers
 */
const identifierRegex = /[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*/u;

export function joinPath(path: NonEmptyArray<string | number>): string {
  if (path.length === 1) {
    return path[0].toString();
  }

  return path.reduce<string>((acc, item) => {
    // handle numeric indices
    if (typeof item === 'number') {
      return acc + '[' + item.toString() + ']';
    }

    // handle quoted values
    if (item.includes('"')) {
      return acc + '["' + escapeQuotes(item) + '"]';
    }

    // handle special characters
    if (!identifierRegex.test(item)) {
      return acc + '["' + item + '"]';
    }

    // handle normal values
    const separator = acc.length === 0 ? '' : '.';
    return acc + separator + item;
  }, '');
}

function escapeQuotes(str: string): string {
  return str.replace(/"/g, '\\"');
}

export type FromZodIssueOptions = {
  issueSeparator?: string;
  unionSeparator?: string;
  prefix?: string | null;
  prefixSeparator?: string;
  includePath?: boolean;
};

export function parseZodIssue(
  issue: ZodIssue,
  options: FromZodIssueOptions = {},
) {
  const {
    issueSeparator = '\n',
    unionSeparator = UNION_SEPARATOR,
    prefixSeparator = PREFIX_SEPARATOR,
    prefix = PREFIX,
    includePath = true,
  } = options;

  const reason = getMessageFromZodIssue({
    issue,
    issueSeparator,
    unionSeparator,
    includePath,
  });
  const message = prefixMessage(reason, prefix, prefixSeparator);

  return {message, issue};
}


export function prefixMessage(
  message: string,
  prefix: string | null,
  prefixSeparator: string
): string {
  if (prefix != null) {
    if (message.length > 0) {
      return [prefix, message].join(prefixSeparator);
    }

    return prefix;
  }

  if (message.length > 0) {
    return message;
  }

  // if both reason and prefix are empty, return default prefix
  // to avoid having an empty error message
  return PREFIX;
}
