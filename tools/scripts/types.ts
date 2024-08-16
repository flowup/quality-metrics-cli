export type RegistryData = {
  protocol: string;
  port: string | number;
  host: string;
  registryNoProtocol: string;
  registry: string;
};

export type RegistryOptions = {
  // local registry target to run
  localRegistryTarget: string;
  // storage folder for the local registry
  storage?: string;
  verbose?: boolean;
  port?: number;
};

export type RegistryResult = {
  registryData: RegistryData;
  stop: () => void;
};

export type PublishOptions = {
  registry?: string;
  tag?: string;
  nextVersion: string;
};
export type NpmInstallOptions = {
  registry?: string;
  tag?: string;
  pkgVersion: string;
};
