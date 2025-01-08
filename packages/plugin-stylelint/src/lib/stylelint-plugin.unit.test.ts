import { describe } from 'vitest';
import { stylelintPlugin } from './stylelint-plugin.js';
import * as utilsModule from './utils.js';

describe.todo('stylelintPlugin', () => {
  it('should work without options', async () => {
    const getAuditsSpy = vi
      .spyOn(utilsModule, 'getAudits')
      .mockImplementationOnce(() => {
        return {} as any;
      });
    const getGroupsSpy = vi
      .spyOn(utilsModule, 'getGroups')
      .mockImplementationOnce(() => {
        return {} as any;
      });
    await expect(stylelintPlugin(['*.css'])).resolves.not.toThrow();
    expect(getAuditsSpy).toHaveBeenCalledTimes(1);
    expect(getGroupsSpy).toHaveBeenCalledTimes(1);
  });
});
