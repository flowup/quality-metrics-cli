export type PublishOptions = {
  projectName?: string;
  directory?: string;
  registry?: string;
  userconfig?: string;
  tag?: string;
  nextVersion: string;
  verbose?: boolean;
};
export type BumpOptions = {
  nextVersion: string;
  verbose?: boolean;
  directory?: string;
};
