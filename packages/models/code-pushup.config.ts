import { CoreConfig } from '@code-pushup/models';
import { mergeConfigs } from '@code-pushup/utils';
import { eslintCoreConfigNx } from '../../code-pushup.preset';

const nxProjectName = process.env.NX_TARGET_PROJECT;
// see: https://github.com/code-pushup/cli/blob/main/packages/models/docs/models-reference.md#coreconfig
export default mergeConfigs(
  {
    plugins: [],
  },
  (await eslintCoreConfigNx(nxProjectName)) as CoreConfig,
);
