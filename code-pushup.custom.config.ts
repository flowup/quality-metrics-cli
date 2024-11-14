import eslintPlugin, {
  eslintConfigFromNxProject,
} from './dist/packages/plugin-eslint';
import type { CoreConfig } from './packages/models/src';

export default {
  plugins: [
    await eslintPlugin(
      // await eslintConfigFromAllNxProjects(),
      await eslintConfigFromNxProject('core'),
    ),
  ],
} satisfies CoreConfig;
