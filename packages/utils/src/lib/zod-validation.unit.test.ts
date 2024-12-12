import { formatErrorPath } from './zod-validation';

describe('formatErrorPath', () => {
  it.each([
    [['categories', 1, 'slug'], 'categories[1].slug'],
    [['plugins', 2, 'groups', 0, 'refs'], 'plugins[2].groups[0].refs'],
    [['refs', 0, 'slug'], 'refs[0].slug'],
    [['categories'], 'categories'],
    [[], ''],
    [['path', 5], 'path[5]'],
  ])('formats error path correctly for $input', (input, expected) => {
    expect(formatErrorPath(input)).toBe(expected);
  });
});
