import { vol } from 'memfs';
import {
  AuditOutputs,
  RunnerFunction,
  auditOutputsSchema,
} from '@code-pushup/models';
import {
  ISO_STRING_REGEXP,
  MEMFS_VOLUME,
  MINIMAL_RUNNER_CONFIG_MOCK,
  MINIMAL_RUNNER_FUNCTION_MOCK,
} from '@code-pushup/testing-utils';
import {
  RunnerResult,
  executeRunnerConfig,
  executeRunnerFunction,
} from './runner';

describe('executeRunnerConfig', () => {
  beforeEach(() => {
    vol.fromJSON(
      {
        'output.json': JSON.stringify([
          {
            slug: 'node-version',
            score: 0.3,
            value: 16,
          },
        ]),
      },
      MEMFS_VOLUME,
    );
  });

  it('should execute valid runner config', async () => {
    const runnerResult = await executeRunnerConfig(MINIMAL_RUNNER_CONFIG_MOCK);

    // data sanity
    expect(runnerResult.audits[0]?.slug).toBe('node-version');
    expect(runnerResult.date).toMatch(ISO_STRING_REGEXP);
    expect(runnerResult.duration).toBeGreaterThanOrEqual(0);

    // schema validation
    expect(() => auditOutputsSchema.parse(runnerResult.audits)).not.toThrow();
  });

  it('should use outputTransform when provided', async () => {
    const runnerResult = await executeRunnerConfig({
      command: 'node',
      args: ['-v'],
      outputFile: 'output.json',
      outputTransform: (outputs: unknown): Promise<AuditOutputs> => {
        return Promise.resolve([
          {
            slug: (outputs as AuditOutputs)[0]!.slug,
            score: 0.3,
            value: 16,
            displayValue: '16.0.0',
          },
        ]);
      },
    });

    expect(runnerResult.audits[0]?.slug).toBe('node-version');
    expect(runnerResult.audits[0]?.displayValue).toBe('16.0.0');
  });

  it('should throw if outputTransform throws', async () => {
    await expect(
      executeRunnerConfig({
        command: 'node',
        args: ['-v'],
        outputFile: 'output.json',
        outputTransform: () => {
          return Promise.reject(
            new Error('Error: outputTransform has failed.'),
          );
        },
      }),
    ).rejects.toThrow('Error: outputTransform has failed.');
  });
});

describe('executeRunnerFunction', () => {
  it('should execute a valid runner function', async () => {
    const runnerResult: RunnerResult = await executeRunnerFunction(
      MINIMAL_RUNNER_FUNCTION_MOCK,
    );

    expect(runnerResult.audits[0]?.slug).toBe('node-version');
    expect(runnerResult.audits[0]?.details?.issues).toEqual([
      expect.objectContaining({
        message: 'The required Node version to run Code PushUp CLI is 18.',
      }),
    ]);
  });

  it('should throw if the runner function throws', async () => {
    const nextSpy = vi.fn();
    await expect(
      executeRunnerFunction(
        () => Promise.reject(new Error('Error: Runner has failed.')),
        nextSpy,
      ),
    ).rejects.toThrow('Error: Runner has failed.');
    expect(nextSpy).not.toHaveBeenCalled();
  });

  it('should throw with an invalid runner type', async () => {
    await expect(
      executeRunnerFunction('' as unknown as RunnerFunction),
    ).rejects.toThrow('runner is not a function');
  });
});
