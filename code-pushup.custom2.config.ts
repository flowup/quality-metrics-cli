import { jsPackagesCoreConfig } from './code-pushup.preset';
import type { CoreConfig } from './packages/models/src';

export default (await jsPackagesCoreConfig()) satisfies CoreConfig;
