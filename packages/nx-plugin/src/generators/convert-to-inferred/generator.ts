import {
  type ProjectConfiguration,
  type TargetConfiguration,
  type Tree,
  createProjectGraphAsync,
  formatFiles,
} from '@nx/devkit';
import { migrateProjectExecutorsToPlugin } from '@nx/devkit/src/generators/plugin-migrations/plugin-migration';
import { processTargetOutputs } from '@nx/devkit/src/generators/plugin-migrations/plugin-migration-utils';
import { basename, dirname, relative } from 'node:path/posix';
import { AutorunCommandExecutorOptions } from '../../executors/autorun/schema';
import { type EslintPluginOptions, createNodesV2 } from '../../plugins/plugin';
import { ESLINT_CONFIG_FILENAMES } from '../../utils/config-file';
import { targetOptionsToCliMap } from './lib/target-options-map';
import { ConvertToInferredGeneratorSchema } from './schema';

export default convertToInferred;

export async function convertToInferred(
  tree: Tree,
  options: ConvertToInferredGeneratorSchema,
) {
  const projectGraph = await createProjectGraphAsync();

  const migratedProjects =
    await migrateProjectExecutorsToPlugin<EslintPluginOptions>(
      tree,
      projectGraph,
      '@nx/eslint/plugin',
      createNodesV2,
      { targetName: 'lint' },
      [
        {
          executors: ['@code-pushup/nx-plugin:autorun'],
          postTargetTransformer,
          targetPluginOptionMapper: (targetName: string) => ({ targetName }),
          skipTargetFilter,
        },
      ],
      options.project,
    );

  if (migratedProjects.size === 0) {
    throw new Error('Could not find any targets to migrate.');
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

function postTargetTransformer(
  target: TargetConfiguration,
  tree: Tree,
  projectDetails: { projectName: string; root: string },
  inferredTargetConfiguration: TargetConfiguration,
): TargetConfiguration {
  if (target.inputs) {
    const inputs = target.inputs.filter(
      input =>
        typeof input === 'string' &&
        !['default', '{projectRoot}/code-pushup.config.*'].includes(input),
    );
    if (inputs.length === 0) {
      delete target.inputs;
    }
  }

  if (target.options) {
    handlePropertiesInOptions(target.options, projectDetails, target);
  }

  if (target.configurations) {
    for (const configurationName in target.configurations) {
      const configuration = target.configurations[configurationName];
      handlePropertiesInOptions(configuration, projectDetails, target);
    }

    if (Object.keys(target.configurations).length !== 0) {
      for (const configuration in target.configurations) {
        if (Object.keys(target.configurations[configuration]).length === 0) {
          delete target.configurations[configuration];
        }
      }
      if (Object.keys(target.configurations).length === 0) {
        delete target.configurations;
      }
    }
  }

  if (target.outputs) {
    processTargetOutputs(target, [], inferredTargetConfiguration, {
      projectName: projectDetails.projectName,
      projectRoot: projectDetails.root,
    });
  }

  return target;
}

function handlePropertiesInOptions(
  options: AutorunCommandExecutorOptions,
  projectDetails: { projectName: string; root: string },
  target: TargetConfiguration,
) {
  if ('upload' in options) {
    if (
      'project' in options.persist &&
      options.persist.project === projectDetails.projectName
    ) {
      delete options.persist;
    }

    for (const key in targetOptionsToCliMap) {
      if (options[key]) {
        const prevValue = options[key];
        delete options[key];
        options[targetOptionsToCliMap[key]] = prevValue;
      }
    }
  }
}

function skipTargetFilter(
  targetOptions: { eslintConfig?: string },
  project: ProjectConfiguration,
) {
  if (targetOptions.eslintConfig) {
    // check that the eslintConfig option is a default config file known by ESLint
    if (
      !ESLINT_CONFIG_FILENAMES.includes(basename(targetOptions.eslintConfig))
    ) {
      return `The "eslintConfig" option value (${targetOptions.eslintConfig}) is not a default config file known by ESLint.`;
    }

    // check that it is at the project root or in a parent directory
    const eslintConfigPath = relative(project.root, targetOptions.eslintConfig);
    if (
      dirname(eslintConfigPath) !== '.' &&
      !eslintConfigPath.startsWith('../')
    ) {
      return `The "eslintConfig" option value (${targetOptions.eslintConfig}) must point to a file in the project root or a parent directory.`;
    }
  }

  return false;
}
