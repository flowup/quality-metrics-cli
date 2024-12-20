import type { ClassDeclaration } from 'ts-morph';
import { nodeMock, sourceFileMock } from './../../../mocks/source-files.mock';
import {
  getClassNodes,
  getUnprocessedCoverageReport,
  mergeCoverageResults,
} from './doc-processer';
import type { UnprocessedCoverageResult } from './models';

describe('getUnprocessedCoverageReport', () => {
  it('should produce a full report', () => {
    const results = getUnprocessedCoverageReport([
      sourceFileMock('test.ts', {
        functions: { 1: true, 2: true, 3: true },
        classes: { 4: false, 5: false, 6: true },
        enums: { 7: true, 8: false, 9: false },
        types: { 10: false, 11: false, 12: true, 40: true },
        interfaces: { 13: true, 14: true, 15: false },
        properties: { 16: false, 17: false, 18: false },
        variables: { 22: true, 23: true, 24: true },
      }),
    ]);
    expect(results).toMatchSnapshot();
  });

  it('should accept array of source files', () => {
    const results = getUnprocessedCoverageReport([
      sourceFileMock('test.ts', { functions: { 1: true, 2: true, 3: false } }),
    ]);
    expect(results).toBeDefined();
  });

  it('should count nodes correctly', () => {
    const results = getUnprocessedCoverageReport([
      sourceFileMock('test.ts', { functions: { 1: true, 2: true, 3: false } }),
    ]);

    expect(results.functions.nodesCount).toBe(3);
  });

  it('should collect uncommented nodes issues', () => {
    const results = getUnprocessedCoverageReport([
      sourceFileMock('test.ts', { functions: { 1: true, 2: false, 3: false } }),
    ]);

    expect(results.functions.issues.length).toBe(2);
  });

  it('should collect valid issues', () => {
    const results = getUnprocessedCoverageReport([
      sourceFileMock('test.ts', { functions: { 1: false } }),
    ]);

    expect(results.functions.issues).toStrictEqual([
      {
        line: 1,
        file: 'test.ts',
        type: 'functions',
        name: 'test',
      },
    ]);
  });

  it('should calculate coverage correctly', () => {
    const results = getUnprocessedCoverageReport([
      sourceFileMock('test.ts', { functions: { 1: true, 2: false } }),
    ]);

    expect(results.functions.coverage).toBe(50);
  });
});

describe('mergeCoverageResults', () => {
  const emptyResult: UnprocessedCoverageResult = {
    enums: { nodesCount: 0, issues: [] },
    interfaces: { nodesCount: 0, issues: [] },
    types: { nodesCount: 0, issues: [] },
    functions: { nodesCount: 0, issues: [] },
    variables: { nodesCount: 0, issues: [] },
    classes: { nodesCount: 0, issues: [] },
    methods: { nodesCount: 0, issues: [] },
    properties: { nodesCount: 0, issues: [] },
  };

  it.each([
    'enums',
    'interfaces',
    'types',
    'functions',
    'variables',
    'classes',
    'methods',
    'properties',
  ])('should merge results on top-level property: %s', type => {
    const secondResult = {
      [type]: {
        nodesCount: 1,
        issues: [{ file: 'test2.ts', line: 1, name: 'test2', type }],
      },
    };

    const results = mergeCoverageResults(
      emptyResult,
      secondResult as Partial<UnprocessedCoverageResult>,
    );
    expect(results).toStrictEqual(
      expect.objectContaining({
        [type]: {
          nodesCount: 1,
          issues: [{ file: 'test2.ts', line: 1, name: 'test2', type }],
        },
      }),
    );
  });

  it('should merge empty results', () => {
    const results = mergeCoverageResults(emptyResult, emptyResult);
    expect(results).toStrictEqual(emptyResult);
  });

  it('should merge second level property nodesCount', () => {
    const results = mergeCoverageResults(
      {
        ...emptyResult,
        enums: { nodesCount: 1, issues: [] },
      },
      {
        enums: { nodesCount: 1, issues: [] },
      },
    );
    expect(results.enums.nodesCount).toBe(2);
  });

  it('should merge second level property issues', () => {
    const results = mergeCoverageResults(
      {
        ...emptyResult,
        enums: {
          nodesCount: 0,
          issues: [
            {
              file: 'file.enum-first.ts',
              line: 6,
              name: 'file.enum-first',
              type: 'enums',
            },
          ],
        },
      },
      {
        enums: {
          nodesCount: 0,
          issues: [
            {
              file: 'file.enum-second.ts',
              line: 5,
              name: 'file.enum-second',
              type: 'enums',
            },
          ],
        },
      },
    );
    expect(results.enums.issues).toStrictEqual([
      {
        file: 'file.enum-first.ts',
        line: 6,
        name: 'file.enum-first',
        type: 'enums',
      },
      {
        file: 'file.enum-second.ts',
        line: 5,
        name: 'file.enum-second',
        type: 'enums',
      },
    ]);
  });
});

describe('getClassNodes', () => {
  it('should return all nodes from a class', () => {
    const nodeMock1 = nodeMock({
      coverageType: 'classes',
      line: 1,
      file: 'test.ts',
      isCommented: false,
    });

    const classNodeSpy = vi.spyOn(nodeMock1, 'getMethods');
    const propertyNodeSpy = vi.spyOn(nodeMock1, 'getProperties');

    getClassNodes([nodeMock1] as unknown as ClassDeclaration[]);

    expect(classNodeSpy).toHaveBeenCalledTimes(1);
    expect(propertyNodeSpy).toHaveBeenCalledTimes(1);
  });
});
