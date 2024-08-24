import { execSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as os from 'os';
import { PID } from './types';

export type ProcessListOption = {
  pid?: PID | PID[];
  commandFilter?: string;
  verbose?: boolean;
};

export function listProcess({ pid, commandFilter }: ProcessListOption = {}): {
  pid: number;
  command: string;
}[] {
  const platform = os.platform();

  const pids = pid ? (Array.isArray(pid) ? pid : [pid]) : [];
  let command: string;

  if (platform === 'darwin' || platform === 'linux') {
    command = 'ps -eo pid,command';
  } else if (platform === 'win32') {
    command = 'wmic process get ProcessId,CommandLine';
  } else {
    throw new Error('Unsupported platform: ' + platform);
  }

  const output = execSync(command).toString().trim();

  return output
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => {
      const parts = line
        .trim()
        .split(/\s+/)
        .map(part => part.trim());
      return {
        pid: parseInt(parts[0] ?? '', 10),
        command: parts.slice(1).join(' '),
      };
    })
    .map(({ pid, command }) => ({
      pid,
      command: command
        .replace(process.cwd(), '.')
        .replace(`node ./${join('node_modules', '.bin')}/`, ''),
    }))
    .filter(({ pid, command }) => {
      if (pids.length > 0) {
        // filter for exact matches
        return pids.some(p => String(p) === String(pid));
      }

      if (commandFilter == null) {
        return true;
      }
      // normalize command string
      const commandToMatch = commandFilter.replace(/\\/g, '').replace(/"/g, '');
      return command.trim().includes(commandToMatch.trim());
    });
}

export function killProcessPid(pid: number | string, command?: string): void {
  const commandString = command ? `, command: ${command}` : '';
  try {
    process.kill(Number(pid), 'SIGKILL');
    console.log(`Killed process with PID: ${pid}${commandString}`);
  } catch (error) {
    console.error(
      `Failed to kill process with PID: ${pid}${commandString}`,
      error,
    );
  }
}

export function killProcesses(opt: ProcessListOption): void {
  const processes = listProcess(opt);

  if (processes.length > 0) {
    processes.forEach(proc => {
      killProcessPid(proc.pid, proc.command);
    });
  } else {
    console.info(`No processes found. Filter: ${JSON.stringify(opt, null, 2)}`);
  }
}

export type NpmScope = 'global' | 'user' | 'project';

export function getNpmrcPath(scope: NpmScope = 'user'): string {
  try {
    const npmConfigArg = scope === 'global' ? 'globalconfig' : 'userconfig';
    return execSync(`npm config get ${npmConfigArg}`).toString().trim();
  } catch (error) {
    throw new Error(
      `Failed to retrieve .npmrc path: ${(error as Error).message}`,
    );
  }
}

export type CleanNpmrcOptions = {
  filePath: string;
  entriesToRemove?: string | string[];
};

export async function cleanNpmrc(options: CleanNpmrcOptions): Promise<void> {
  const {
    filePath = getNpmrcPath(),
    entriesToRemove: rawEntriesToRemove = [],
  } = options;
  const entriesToRemove = Array.isArray(rawEntriesToRemove)
    ? rawEntriesToRemove
    : [rawEntriesToRemove];

  try {
    const fileContent = await readFile(filePath, 'utf-8');

    const filteredEntries: string[] = [];
    const updatedContent = fileContent
      .split('\n')
      .filter(line => {
        if (entriesToRemove.length <= 0) {
          return true;
        }

        const trimmedLine = line.trim();
        // Ignore empty lines or comments
        if (!trimmedLine || trimmedLine.startsWith('#')) {
          return true;
        }

        const isMatch = entriesToRemove.some(key => trimmedLine.includes(key));
        isMatch && filteredEntries.push(trimmedLine);
        return !isMatch;
      })
      .join('\n');
    await writeFile(filePath, updatedContent, 'utf-8');
    console.log(
      `Successfully cleaned ${filePath} with filter ${entriesToRemove.join(
        ', ',
      )}.`,
    );
    if (filteredEntries.length > 0) {
      console.log(`Removed keys: \n${filteredEntries.join(', ')}`);
    } else {
      console.log(`No entries removed.`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}
