import {
  type ChildProcess,
  type SpawnOptionsWithStdioTuple,
  type StdioPipe,
  spawn,
} from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ui } from './logging';
import { calcDuration } from './reports/utils';

/**
 * Represents the process result.
 * @category Types
 * @public
 * @property {string} outputFile - File where the stdout of the process was piped to.
 */
export type ProcessResultWithOutputFile = {
  outputFile: string;
} & ProcessResultBase;

/**
 * Represents the process result.
 * @category Types
 * @property {string} stderr - The stderr of the process.
 * @property {number | null} code - The exit code of the process.
 * @property {number | null} date - Date-stamp when the process was run.
 * @property {number | null} duration - Measurement how long was process running.
 */
type ProcessResultBase = {
  stderr: string;
  code: number | null;
  date: string;
  duration: number;
};

/**
 * Represents the process result.
 * @category Types
 * @public
 * @property {string} stdout - The stdout of the process.
 */
export type ProcessResult = {
  stdout: string;
} & ProcessResultBase;

/**
 * Error class for process errors.
 * Contains additional information about the process result.
 * @category Error
 * @public
 * @class
 * @extends Error
 * @example
 * const result = await executeProcess({})
 * .catch((error) => {
 *   if (error instanceof ProcessError) {
 *   console.error(error.code);
 *   console.error(error.stderr);
 *   console.error(error.stdout);
 *   }
 * });
 *
 */
export class ProcessError extends Error {
  code: number | null;
  stderr: string;
  stdout?: string;
  outputFile?: string;

  constructor(result: ProcessResult | ProcessResultWithOutputFile) {
    super(result.stderr);
    this.code = result.code;
    this.stderr = result.stderr;
    if ('stdout' in result) {
      this.stdout = result.stdout;
    } else {
      this.outputFile = result.outputFile;
    }
  }
}

/**
 * Process config object. Contains the command, args and observer.
 * @param cfg - process config object with command, args and observer (optional)
 * @category Types
 * @public
 * @property {string} command - The command to execute.
 * @property {string[]} args - The arguments for the command.
 * @property {ProcessObserver} observer - The observer for the process.
 *
 * @example
 *
 * // bash command
 * const cfg = {
 *   command: 'bash',
 *   args: ['-c', 'echo "hello world"']
 * };
 *
 * // node command
 * const cfg = {
 * command: 'node',
 * args: ['--version']
 * };
 *
 * // npx command
 * const cfg = {
 * command: 'npx',
 * args: ['--version']
 *
 */
export type ProcessConfig = Omit<
  SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioPipe>,
  'stdio'
> & {
  command: string;
  args?: string[];
  observer?: ProcessObserver;
  ignoreExitCode?: boolean;
};

/**
 * Process observer object. Contains the onStdout, error and complete function.
 * @category Types
 * @public
 * @property {function} onStdout - The onStdout function of the observer (optional).
 * @property {function} onError - The error function of the observer (optional).
 * @property {function} onComplete - The complete function of the observer (optional).
 *
 * @example
 * const observer = {
 *  onStdout: (stdout) => console.info(stdout)
 *  }
 */
export type ProcessObserver = {
  onStdout?: (stdout: string, sourceProcess?: ChildProcess) => void;
  onStderr?: (stderr: string, sourceProcess?: ChildProcess) => void;
  onError?: (error: ProcessError) => void;
  onComplete?: () => void;
};

// const MAX_STRING_LEN = 536_870_888;

/**
 * Executes a process and returns a promise with the result as with stdout.
 *
 * @example
 *
 * // sync process execution
 * const result = await executeProcess({
 *  command: 'node',
 *  args: ['--version']
 * });
 *
 * console.info(result);
 *
 * // async process execution
 * const result = await executeProcess({
 *    command: 'node',
 *    args: ['download-data.js'],
 *    observer: {
 *      onStdout: updateProgress,
 *      error: handleError,
 *      complete: cleanLogs,
 *    }
 * });
 *
 * console.info(result);
 *
 * @param cfg - see {@link ProcessConfig}
 */
export function executeProcess(cfg: ProcessConfig): Promise<ProcessResult> {
  const { command, args, observer, ignoreExitCode = false, ...options } = cfg;
  const { onStdout, onStderr, onError, onComplete } = observer ?? {};
  const date = new Date().toISOString();
  const start = performance.now();

  return new Promise((resolve, reject) => {
    const spawnedProcess = spawn(command, args ?? [], {
      shell: true, // tells Windows to use shell command for spawning a child process
      windowsHide: true,

      ...options,
    });

    // eslint-disable-next-line functional/no-let
    let stdout = '';
    // eslint-disable-next-line functional/no-let
    let stderr = '';

    spawnedProcess.stdout.on('data', data => {
      stdout += String(data);
      onStdout?.(String(data), spawnedProcess);
    });

    spawnedProcess.stderr.on('data', data => {
      stderr += String(data);
      onStderr?.(String(data), spawnedProcess);
    });

    spawnedProcess.on('error', err => {
      stderr += err.toString();
    });

    spawnedProcess.on('close', code => {
      const timings = { date, duration: calcDuration(start) };
      if (code === 0 || ignoreExitCode) {
        onComplete?.();
        resolve({ code, stdout, stderr, ...timings });
      } else {
        const errorMsg = new ProcessError({ code, stdout, stderr, ...timings });
        onError?.(errorMsg);
        reject(errorMsg);
      }
    });
  });
}

/**
 * Executes a process and returns a promise with the result with stdout piped to a file.
 */
// eslint-disable-next-line max-lines-per-function
export function executeProcessWithOutputFile(
  cfg: ProcessConfig,
): Promise<ProcessResultWithOutputFile> {
  const { command, args, observer, ignoreExitCode = false, ...options } = cfg;
  const { onStderr, onError, onComplete } = observer ?? {};
  const date = new Date().toISOString();
  const start = performance.now();

  return new Promise((resolve, reject) => {
    // Use provided output path or generate a temporary file path with a human-readable timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Replace characters that are not filesystem-friendly
    const outputPath = `output.json`;
    const outputFile = outputPath || join(tmpdir(), `output-${timestamp}.json`);

    // Create a writable stream to save the output
    const output = createWriteStream(outputFile, {
      autoClose: true,
      flags: 'w',
    });

    output.on('error', error => {
      ui().logger.error(
        `Error writing stdout of command '${command}' to file: ${error.message}`,
      );
    });

    const spawnedProcess = spawn(command, args ?? [], {
      shell: true, // tells Windows to use shell command for spawning a child process
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'overlapped'],

      ...options,
    });

    spawnedProcess.stdout.pipe(output);

    // eslint-disable-next-line functional/no-let
    let stderr = '';

    spawnedProcess.stderr.on('data', data => {
      stderr += String(data);
      onStderr?.(String(data), spawnedProcess);
    });

    spawnedProcess.on('error', error => {
      ui().logger.error(
        `Failed to start sub-process of command '${command}'\n${error.message}`,
      );
      stderr += error.toString();
    });

    spawnedProcess.on('close', code => {
      output.close(); // Ensure the file stream is closed
      const timings = { date, duration: calcDuration(start) };
      if (code === 0 || ignoreExitCode) {
        onComplete?.();
        resolve({ code, outputFile, stderr, ...timings });
      } else {
        const errorMsg = new ProcessError({
          code,
          outputFile,
          stderr,
          ...timings,
        });
        onError?.(errorMsg);
        reject(errorMsg);
      }
    });
  });
}
