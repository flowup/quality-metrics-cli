import { describe, expect, vi } from 'vitest';
import { autoloadRc, readRcByPath } from '@code-pushup/core';
import { coreConfigMiddleware } from './core-config.middleware';

vi.mock('@code-pushup/core', async () => {
  const { CORE_CONFIG_MOCK }: typeof import('@code-pushup/testing-utils') =
    await vi.importActual('@code-pushup/testing-utils');
  const core: object = await vi.importActual('@code-pushup/core');
  return {
    ...core,
    readRcByPath: vi.fn().mockResolvedValue(CORE_CONFIG_MOCK),
    autoloadRc: vi.fn().mockResolvedValue(CORE_CONFIG_MOCK),
  };
});

describe('coreConfigMiddleware', () => {
  it('should attempt to load code-pushup.config.(ts|mjs|js) by default', async () => {
    await coreConfigMiddleware({});
    expect(autoloadRc).toHaveBeenCalled();
  });

  it('should directly attempt to load passed config', async () => {
    await coreConfigMiddleware({ config: 'cli/custom-config.mjs' });
    expect(autoloadRc).not.toHaveBeenCalled();
    expect(readRcByPath).toHaveBeenCalledWith('cli/custom-config.mjs');
  });
});
