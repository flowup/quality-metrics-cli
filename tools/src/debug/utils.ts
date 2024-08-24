import { execSync } from 'node:child_process';
import { join } from 'node:path';
import * as os from 'os';
import { PID } from './types';

export type ProcessListOption = {
  pid?: PID | PID[];
  commandRegex?: string;
  verbose?: boolean;
};

export function listProcess({ pid, commandRegex }: ProcessListOption = {}): {
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

      // normalize command string
      const commandToMatch = commandRegex.replace(/\\/g, '').replace(/"/g, '');

      if (commandToMatch) {
        return command.trim().includes(commandToMatch.trim());
      }
      return true;
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
