import { uniquePort } from './utils';

//  - \`-l | --listen | -p | --port\` to switch the default server port,
//       - \`-c | --config\` to define a different configuration path location,
export type VerdaccioCliOnlyOptions = {
  port?: string;
  p?: string;
  config?: string;
  c?: string;
  location: string;
  // reset or remove cached packages and or metadata.
  clear: boolean;
};

export type RegistryData = {
  protocol: string;
  port: string | number;
  host: string;
  urlNoProtocol: string;
  url: string;
};

uniquePort();
export type StartVerdaccionOptions = {
  location?: string;
  port?: string | number;
  // storage folder for the local registry
  storage?: string;
  verbose?: boolean;
};
export type RegistryResult = {
  registryData: RegistryData;
  storage: string;
  stop: () => void;
};
