import { execFileSync } from 'child_process';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import {
  ensureDirectoryExists,
  projectE2eScope,
} from '@code-pushup/test-utils';
import { RegistryData } from './types';

export function uniquePort(): number {
  return Number((6000 + Number(Math.random() * 1000)).toFixed(0));
}

export function projectStorage(projectName: string) {
  return join(projectE2eScope(projectName), 'storage');
}

export async function setupNpmWorkspace(directory: string, verbose?: boolean) {
  verbose && console.info(`Execute: npm init in directory ${directory}`);
  const cwd = process.cwd();
  await ensureDirectoryExists(directory);
  process.chdir(join(cwd, directory));
  try {
    execFileSync('npm', ['init', '--force']).toString();
  } catch (error) {
    console.error(`Error creating NPM workspace: ${(error as Error).message}`);
  } finally {
    process.chdir(cwd);
  }
}

export function configureRegistry(
  { host, url, urlNoProtocol }: RegistryData,
  userconfig: string,
  verbose?: boolean,
) {
  /**
   * Protocol-Agnostic Configuration: The use of // allows NPM to configure authentication for a registry without tying it to a specific protocol (http: or https:).
   * This is particularly useful when the registry might be accessible via both HTTP and HTTPS.
   *
   * Example: //registry.npmjs.org/:_authToken=your-token
   */
  const token = 'secretVerdaccioToken';
  const setAuthToken = `npm config set ${urlNoProtocol}/:_authToken "${token}" --userconfig="./${userconfig}/.npmrc"`;
  verbose && console.info(`Execute: ${setAuthToken}`);
  execSync(setAuthToken);

  // set default registry in workspace
  const setRegistry = `npm config set registry="${url}" --userconfig="./${userconfig}/.npmrc"`;
  verbose && console.info(`Execute: ${setRegistry}`);
  execSync(setRegistry);
}

export function unconfigureRegistry(
  { urlNoProtocol }: Pick<RegistryData, 'urlNoProtocol'>,
  verbose?: boolean,
) {
  execSync(`npm config delete ${urlNoProtocol}/:_authToken`);
  console.info('delete npm authToken: ' + urlNoProtocol);
}

export function parseRegistryData(stdout: string): RegistryData {
  const output = stdout.toString();

  // Extract protocol, host, and port
  const match = output.match(
    /(?<proto>https?):\/\/(?<host>[^:]+):(?<port>\d+)/,
  );

  if (!match?.groups) {
    throw new Error('Could not parse registry data from stdout');
  }

  const protocol = match.groups['proto'];
  if (!protocol || !['http', 'https'].includes(protocol)) {
    throw new Error(
      `Invalid protocol ${protocol}. Only http and https are allowed.`,
    );
  }
  const host = match.groups['host'];
  if (!host) {
    throw new Error(`Invalid host ${String(host)}.`);
  }
  const port = !Number.isNaN(Number(match.groups['port']))
    ? Number(match.groups['port'])
    : undefined;
  if (!port) {
    throw new Error(`Invalid port ${String(port)}.`);
  }
  return {
    protocol,
    host,
    port,
    urlNoProtocol: `//${host}:${port}`,
    url: `${protocol}://${host}:${port}`,
  } satisfies RegistryData;
}
