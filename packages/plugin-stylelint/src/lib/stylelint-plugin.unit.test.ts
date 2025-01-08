import { describe } from 'vitest';
import { stylelintPlugin } from './stylelint-plugin.js';

describe('stylelint-plugin', () => {
  it('should work without options', async () => {
    await expect(stylelintPlugin()).resolves.not.toThrow();
  });
});
