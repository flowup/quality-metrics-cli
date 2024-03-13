import { isAbsolute, join, relative } from 'node:path';
import { StatusResult, simpleGit } from 'simple-git';
import { Commit, commitSchema } from '@code-pushup/models';
import { ui } from './logging';
import { toUnixPath } from './transform';

export async function getLatestCommit(
  git = simpleGit(),
): Promise<Commit | null> {
  // git log -1 --pretty=format:"%H %s %an %aI"
  // https://git-scm.com/docs/pretty-formats
  const log = await git.log({
    maxCount: 1,
    format: { hash: '%H', message: '%s', author: '%an', date: '%aI' },
  });
  if (!log.latest) {
    return null;
  }
  return commitSchema.parse(log.latest);
}

export function getGitRoot(git = simpleGit()): Promise<string> {
  return git.revparse('--show-toplevel');
}

export function formatGitPath(path: string, gitRoot: string): string {
  const absolutePath = isAbsolute(path) ? path : join(process.cwd(), path);
  const relativePath = relative(gitRoot, absolutePath);
  return toUnixPath(relativePath);
}

export async function toGitPath(
  path: string,
  git = simpleGit(),
): Promise<string> {
  const gitRoot = await getGitRoot(git);
  return formatGitPath(path, gitRoot);
}

export class GitStatueError extends Error {
  static ignoredProps = new Set(['current', 'tracking']);

  static getReducedStatus(status: StatusResult) {
    return Object.fromEntries(
      Object.entries(status)
        .filter(([key]) => !this.ignoredProps.has(key))
        .filter(
          (
            entry: [
              string,
              number | string | boolean | null | undefined | unknown[],
            ],
          ) => {
            const value = entry[1];
            if (value == null) {
              return false;
            }
            if (Array.isArray(value) && value.length === 0) {
              return false;
            }
            if (typeof value === 'number' && value === 0) {
              return false;
            }
            return !(typeof value === 'boolean' && !value);
          },
        ),
    );
  }
  constructor(status: StatusResult) {
    super(
      `Working directory needs to be clean before we you can proceed. Commit your local changes or stash them: \n ${JSON.stringify(
        GitStatueError.getReducedStatus(status),
        null,
        2,
      )}`,
    );
  }
}

export async function guardAgainstLocalChanges(
  git = simpleGit(),
): Promise<void> {
  const status = await git.status(['-s']); //.then(r => r.files.length === 0);
  if (status.files.length > 0) {
    throw new GitStatueError(status);
  }
}

export async function getCurrentBranchOrTag(
  git = simpleGit(),
): Promise<string> {
  const branch = await git.branch().then(r => r.current);
  // eslint-disable-next-line unicorn/prefer-ternary
  if (branch) {
    return branch;
  } else {
    // If no current branch, try to get the tag
    // @TODO use simple git
    return await git
      .raw(['describe', '--tags', '--exact-match'])
      .then(out => out.trim());
  }
}

export async function safeCheckout(
  branchOrHash: string,
  forceCleanStatus = false,
  git = simpleGit(),
): Promise<void> {
  // git requires a clean history to check out a branch
  if (forceCleanStatus) {
    await git.raw(['reset', '--hard']);
    await git.clean(['f', 'd']);
    ui().logger.info(`git status cleaned`);
  }
  await guardAgainstLocalChanges(git);
  await git.checkout(branchOrHash);
}
