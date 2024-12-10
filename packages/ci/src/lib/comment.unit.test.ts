import { vol } from 'memfs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MEMFS_VOLUME } from '@code-pushup/test-utils';
import { commentOnPR } from './comment.js';
import type { Comment, Logger, ProviderAPIClient } from './models.js';

describe('commentOnPR', () => {
  const diffText = '# Code PushUp\n\nNo changes to report.\n';
  const diffFile = 'report-diff.md';
  const diffPath = join(MEMFS_VOLUME, diffFile);

  const comment: Comment = {
    id: 42,
    body: `${diffText}\n\n<!-- generated by @code-pushup/ci -->\n`,
    url: 'https://fake.git.repo/comments/42',
  };
  const otherComment: Comment = {
    id: 666,
    body: 'LGTM!',
    url: 'https://fake.git.repo/comments/666',
  };

  const api = {
    maxCommentChars: 1_000_000,
    createComment: vi.fn().mockResolvedValue(comment),
    updateComment: vi.fn().mockResolvedValue(comment),
    listComments: vi.fn(),
  } satisfies ProviderAPIClient;

  const logger: Logger = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };

  beforeEach(() => {
    vol.fromJSON({ [diffFile]: diffText }, MEMFS_VOLUME);
    api.listComments.mockResolvedValue([]);
  });

  it('should create new comment if none existing', async () => {
    api.listComments.mockResolvedValue([]);

    await expect(commentOnPR(diffPath, api, logger)).resolves.toBe(comment.id);

    expect(api.listComments).toHaveBeenCalled();
    expect(api.createComment).toHaveBeenCalledWith(comment.body);
    expect(api.updateComment).not.toHaveBeenCalled();
  });

  it("should create new comment if existing comments don't match", async () => {
    api.listComments.mockResolvedValue([otherComment]);

    await expect(commentOnPR(diffPath, api, logger)).resolves.toBe(comment.id);

    expect(api.listComments).toHaveBeenCalled();
    expect(api.createComment).toHaveBeenCalledWith(comment.body);
    expect(api.updateComment).not.toHaveBeenCalled();
  });

  it('should update previous comment if it matches', async () => {
    api.listComments.mockResolvedValue([comment]);

    await expect(commentOnPR(diffPath, api, logger)).resolves.toBe(comment.id);

    expect(api.listComments).toHaveBeenCalled();
    expect(api.createComment).not.toHaveBeenCalled();
    expect(api.updateComment).toHaveBeenCalledWith(comment.id, comment.body);
  });

  it('should update previous comment which matches and ignore other comments', async () => {
    api.listComments.mockResolvedValue([otherComment, comment]);

    await expect(commentOnPR(diffPath, api, logger)).resolves.toBe(comment.id);

    expect(api.listComments).toHaveBeenCalled();
    expect(api.createComment).not.toHaveBeenCalled();
    expect(api.updateComment).toHaveBeenCalledWith(comment.id, comment.body);
  });

  it('should truncate comment body if it exceeds character limit', async () => {
    const longDiffText = Array.from({ length: 100_000 })
      .map((_, i) => `- Audit #${i} failed`)
      .join('\n');
    await writeFile(diffPath, longDiffText);

    await expect(commentOnPR(diffPath, api, logger)).resolves.toBe(comment.id);

    expect(api.createComment).toHaveBeenCalledWith(
      expect.stringContaining('...*[Comment body truncated]*'),
    );
    expect(logger.warn).toHaveBeenCalledWith(
      'Comment body is too long. Truncating to 1000000 characters.',
    );
  });
});
