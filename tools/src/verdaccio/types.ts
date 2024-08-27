export type VerdaccioCliOnlyOptions = {
  port?: string;
  p?: string;
  config?: string;
  c?: string;
  location: string;
  // reset or remove cached packages and or metadata.
  clear: boolean;
};

export type StartVerdaccionOptions = {
  location?: string;
  port?: string | number;
  // storage folder for the local registry
  storage?: string;
  verbose?: boolean;
};

export type RegistryData = {
  protocol: string;
  port: string | number;
  host: string;
  urlNoProtocol: string;
  url: string;
  storage: string;
  prefix: string;
  userconfig: string;
};

export type RegistryOptions = {
  // local registry target to run
  localRegistryTarget: string;
  // storage folder for the local registry
  storage?: string;
  verbose?: boolean;
};
export type RegistryResult = {
  registryData: RegistryData;
  stop: () => void;
};
