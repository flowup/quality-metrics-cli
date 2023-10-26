/**
 * This config file is here to demonstrate the JavaScript version of the 4 different supported versions ('ts' | 'mjs' | 'cjs' | 'js')
 *
 * Usage:
 * npx ./dist/packages/cli collect --config=./packages/cli/test/js-format.config.mock.js
 */
import {join} from "path";

const outputDir = 'tmp';
export default {
  upload: {
    organization: 'code-pushup',
    project: 'cli-js',
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
      runner: {
        command: 'node',
        args: [
          'echo',
          `require('fs').writeFileSync(require('path').join(outputDir, "out.json"), '${JSON.stringify(
            [
              {
                title: 'dummy-title',
                slug: 'command-object-audit-slug',
                value: 0,
                score: 0,
              },
            ],
          )}')`,
        ],
        outputFile: join(outputDir, 'out.json'),
      },
      groups: [],
      slug: 'command-object-plugin',
      title: 'command-object plugin',
      icon: 'javascript',
    },
  ],
  categories: [],
};
