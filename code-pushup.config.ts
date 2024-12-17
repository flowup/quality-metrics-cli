import { CoreConfig } from '@code-pushup/models';
import {
  coverageCoreConfigNx,
  eslintCoreConfigNx,
  jsPackagesCoreConfig,
  lighthouseCoreConfig,
} from './code-pushup.preset';
import {
  fileSizePlugin,
  fileSizeRecommendedRefs,
  packageJsonDocumentationGroupRef,
  packageJsonPerformanceGroupRef,
  packageJsonPlugin,
} from './dist/examples/plugins';
import { mergeConfigs } from './dist/packages/utils';

const config = {
  plugins: [
    fileSizePlugin({
      directory: './dist/packages',
      pattern: /\.js$/,
      budget: 174_080, // 170 kB
    }),
    packageJsonPlugin({
      directory: './dist/packages',
      license: 'MIT',
      type: 'module',
    }),
  ],

  categories: [
    {
      slug: 'custom-checks',
      title: 'Custom checks',
      refs: [
        ...fileSizeRecommendedRefs,
        packageJsonPerformanceGroupRef,
        packageJsonDocumentationGroupRef,
      ],
    },
  ],
};

export default mergeConfigs(
  config as CoreConfig,
  await coverageCoreConfigNx(),
  await jsPackagesCoreConfig(),
  await lighthouseCoreConfig(
    'https://github.com/code-pushup/cli?tab=readme-ov-file#code-pushup-cli/',
  ),
  await eslintCoreConfigNx(),
);
