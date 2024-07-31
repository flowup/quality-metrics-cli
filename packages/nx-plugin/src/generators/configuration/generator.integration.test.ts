import {
  Tree,
  addProjectConfiguration,
  readProjectConfiguration,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_TARGET_NAME, PACKAGE_NAME } from '../../internal/constants';
import { generateCodePushupConfig } from './code-pushup-config';
import { addTargetToProject, configurationGenerator } from './generator';

describe('generateCodePushupConfig', () => {
  let tree: Tree;
  const testProjectName = 'test-app';
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, testProjectName, {
      root: 'test-app',
    });
  });

  it('should add code-pushup.config.ts to the project root', () => {
    generateCodePushupConfig(tree, testProjectName);

    expect(tree.exists('test-app/code-pushup.config.ts')).toBe(true);
    expect(
      tree.read('test-app/code-pushup.config.ts')?.toString(),
    ).toMatchSnapshot();
  });
});

describe('addTargetToProject', () => {
  let tree: Tree;
  const testProjectName = 'test-app';
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'test-app', {
      root: 'test-app',
    });
  });
  afterEach(() => {
    //reset tree
    tree.delete(testProjectName);
  });

  it('should generate a project target', () => {
    addTargetToProject(
      tree,
      {
        root: testProjectName,
        projectType: 'library',
        sourceRoot: `${testProjectName}/src`,
        targets: {},
      },
      {
        project: testProjectName,
      },
    );

    const projectConfiguration = readProjectConfiguration(
      tree,
      testProjectName,
    );

    expect(projectConfiguration.targets?.[DEFAULT_TARGET_NAME]).toEqual({
      executor: `${PACKAGE_NAME}:autorun`,
    });
  });

  it('should use targetName to generate a project target', () => {
    addTargetToProject(
      tree,
      {
        root: testProjectName,
        projectType: 'library',
        sourceRoot: `${testProjectName}/src`,
        targets: {},
      },
      {
        project: testProjectName,
        targetName: 'cp',
      },
    );

    const projectConfiguration = readProjectConfiguration(
      tree,
      testProjectName,
    );

    expect(projectConfiguration.targets?.['cp']).toEqual({
      executor: `${PACKAGE_NAME}:autorun`,
    });
  });

  it('should use bin to generate a project target', () => {
    addTargetToProject(
      tree,
      {
        root: testProjectName,
        projectType: 'library',
        sourceRoot: `${testProjectName}/src`,
        targets: {},
      },
      {
        project: testProjectName,
        bin: '../my-plugin',
      },
    );

    const projectConfiguration = readProjectConfiguration(
      tree,
      testProjectName,
    );

    expect(projectConfiguration.targets?.[DEFAULT_TARGET_NAME]).toEqual({
      executor: '../my-plugin:autorun',
    });
  });
});

describe('configurationGenerator', () => {
  let tree: Tree;
  const testProjectName = 'test-app';
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'test-app', {
      root: 'test-app',
    });
  });

  afterEach(() => {
    tree.delete(testProjectName);
  });

  it('should generate a project target and config file', async () => {
    await configurationGenerator(tree, {
      project: testProjectName,
    });

    const projectConfiguration = readProjectConfiguration(
      tree,
      testProjectName,
    );

    expect(projectConfiguration.targets?.[DEFAULT_TARGET_NAME]).toEqual({
      executor: `${PACKAGE_NAME}:autorun`,
    });
  });

  it('should skip target creation if skipTarget is used', async () => {
    await configurationGenerator(tree, {
      project: testProjectName,
      skipTarget: true,
    });

    const projectConfiguration = readProjectConfiguration(
      tree,
      testProjectName,
    );
    expect(projectConfiguration.targets).toBeUndefined();
  });
});
