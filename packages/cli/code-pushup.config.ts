import { mergeConfigs } from '@code-pushup/utils';
import {
  eslintCoreConfigNx,
  jsPackagesCoreConfig,
} from '../../code-pushup.preset';

const nxProjectName = process.env.NX_TASK_TARGET_PROJECT;

export default mergeConfigs(
  await jsPackagesCoreConfig(),
  await eslintCoreConfigNx(nxProjectName),
);
