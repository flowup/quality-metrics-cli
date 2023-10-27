import { join } from 'path';
import { createFileWriteRunnerConfig } from './file-write-runner-config';

const outputDir = 'tmp';
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
      runner: createFileWriteRunnerConfig(
        [
          {
            slug: 'command-object-audit-slug',
            value: 0,
            score: 0,
          },
        ],
        join(outputDir, 'out.json'),
      ),
      groups: [],
      slug: 'command-object-plugin',
      title: 'command-object plugin',
      icon: 'javascript',
    },
  ],
  categories: [],
};
