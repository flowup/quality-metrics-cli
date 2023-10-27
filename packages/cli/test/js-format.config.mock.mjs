/**
 * This config file is here to demonstrate the EcmaScriptModule version of the 4 different supported versions ('ts' | 'mjs' | 'cjs' | 'js')
 *
 * Usage:
 * npx ./dist/packages/cli collect --config=./packages/cli/test/js-format.config.mock.mjs
 */
import { join } from 'path';
import { echoRunnerConfig } from './echo-runner-config.mock';


const outputDir = 'tmp';
const outputFile = join(outputDir, `out.${Date.now()}.json`);
export default {
  upload: {
    organization: 'code-pushup',
    project: 'cli-mjs',
    apiKey: 'dummy-api-key',
    server: 'https://example.com/api',
  },
  persist: { outputDir },
  plugins: [
    {
      audits: [
        {
          slug: 'command-object-audit-slug',
          title: 'audit title',
          description: 'audit description',
          docsUrl: 'http://www.my-docs.dev',
        },
      ],
      runner: echoRunnerConfig(
        [
          {
            slug: 'command-object-audit-slug',
            value: 0,
            score: 0,
          },
        ],
        outputFile,
      },
      groups: [],
      slug: 'command-object-plugin',
      title: 'command-object plugin',
      icon: 'javascript',
    },
  ],
  categories: [],
};
