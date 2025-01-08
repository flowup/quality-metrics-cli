import {beforeAll, type MockInstance} from "vitest";
import stylelint from "stylelint";

describe('getNormalizedConfig', () => {

  let lintSpy: MockInstance<
    [stylelint.LinterOptions], // Arguments of stylelint.lint
    Promise<stylelint.LinterResult> // Return type of stylelint.lint
  >;

  beforeAll(() => {
    lintSpy = vi.spyOn(stylelint, '_createLinter').mockResolvedValueOnce({});
  })


  it('should call _createLinter only once per file parameter ', async ()=> {
    await getNormalizedConfig().resolves.not.toThrow();
    expect(lintSpy).toHav
  });

});
