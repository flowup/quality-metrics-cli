import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { projectE2eScope } from '../../../testing/test-utils/src/lib/utils/e2e';
import { RegistryData } from './types';

export function uniquePort(): number {
  return Number((6000 + Number(Math.random() * 1000)).toFixed(0));
}

export function projectStorage(projectName: string) {
  return join(projectE2eScope(projectName), 'storage');
}

export function configureRegistry(
  { host, url, urlNoProtocol }: RegistryData,
  userconfig: string,
  verbose?: boolean,
) {
  /**
   * Sets environment variables for NPM and Yarn registries, and optionally configures
   * Yarn's unsafe HTTP whitelist.
   *
   * @param {string} registry - The registry URL to set for NPM and Yarn.
   * @param {string} host - The hostname to whitelist for Yarn (optional).
   *
   * Variables Set:
   * - `npm_config_registry`: NPM registry.
   * - `YARN_REGISTRY`: Yarn v1 registry.
   * - `YARN_NPM_REGISTRY_SERVER`: Yarn v2 registry.
   * - `YARN_UNSAFE_HTTP_WHITELIST`: Yarn HTTP whitelist.
   */
  // process.env['npm_config_registry'] = url;
  process.env['YARN_REGISTRY'] = url;
  process.env['YARN_NPM_REGISTRY_SERVER'] = url;
  verbose && console.info(`Set NPM and yarn registry process.env`);

  /**
   * Optional: Set Yarn HTTP whitelist for non-HTTPS registries.
   */
  process.env['YARN_UNSAFE_HTTP_WHITELIST'] = host;
  verbose && console.info(`Set yarn whitelíst process.env`);

  /**
   * Protocol-Agnostic Configuration: The use of // allows NPM to configure authentication for a registry without tying it to a specific protocol (http: or https:).
   * This is particularly useful when the registry might be accessible via both HTTP and HTTPS.
   *
   * Example: //registry.npmjs.org/:_authToken=your-token
   */
  const token = 'secretVerdaccioToken';
  const command = `npm config set ${urlNoProtocol}/:_authToken "${token}" --userconfig="./${userconfig}/.npmrc"`;
  verbose && console.info(`Execute: ${command}`);
  execSync(command);
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
