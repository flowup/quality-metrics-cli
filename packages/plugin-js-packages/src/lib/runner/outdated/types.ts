// Subset of NPM outdated JSON type
export const versionType = ['major', 'minor', 'patch'] as const;
export type VersionType = (typeof versionType)[number];
export type PackageVersion = Record<VersionType, number>;
export type DependencyGroupLong =
  | 'dependencies'
  | 'devDependencies'
  | 'optionalDependencies';

export type VersionOverview = {
  current?: string;
  latest: string;
  type: DependencyGroupLong;
  homepage?: string;
};

export type NormalizedVersionOverview = Omit<VersionOverview, 'current'> & {
  current: string;
};
export type NormalizedOutdatedEntries = [string, NormalizedVersionOverview][];
export type NpmOutdatedResultJson = Record<string, VersionOverview>;

// Subset of Yarn v1 outdated JSON type
export type Yarnv1VersionOverview = [
  string, // package
  string, // current
  string, // wanted
  string, // latest
  string, // workspace
  DependencyGroupLong, // package type
  string, // URL
];

type Yarnv1Info = { type: 'info' };
type Yarnv1Table = {
  type: 'table';
  data: {
    body: Yarnv1VersionOverview[];
  };
};

export type Yarnv1OutdatedResultJson = [Yarnv1Info, Yarnv1Table];

// Unified Outdated result type
export type OutdatedResult = {
  name: string;
  current: string;
  latest: string;
  type: DependencyGroupLong;
  url?: string;
}[];
