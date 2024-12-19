import {
  eslintCoreConfigNx,
  jsPackagesCoreConfig,
} from '../../code-pushup.preset';
import { mergeConfigs } from '../../tools/src/merge-configs';

const nxProjectName = process.env.NX_TASK_TARGET_PROJECT;

export default mergeConfigs(
  await jsPackagesCoreConfig(),
  await eslintCoreConfigNx(nxProjectName),
);
