import {join, relative} from 'node:path';
import {CONFIG_FILE_NAME, CoreConfig, coreConfigSchema, SUPPORTED_CONFIG_FILE_FORMATS,} from '@code-pushup/models';
import {fileExists, importModule} from '@code-pushup/utils';
import * as process from "process";
import {bold} from "ansis";
import {parseZodIssue} from "@code-pushup/utils";
import {ZodIssue} from "zod";

export class ConfigPathError extends Error {
  constructor(configPath: string) {
    super(`Provided path '${configPath}' is not valid.`);
  }
}

export async function readRcByPath(
  filepath: string,
  tsconfig?: string,
): Promise<CoreConfig> {
  if (filepath.length === 0) {
    throw new Error('The path to the configuration file is empty.');
  }

  if (!(await fileExists(filepath))) {
    throw new ConfigPathError(filepath);
  }

  const cfg = await importModule({filepath, tsconfig, format: 'esm'});

  const {success, data, error} = coreConfigSchema.safeParse(cfg);

  if (!success) {
    throw new Error(`Failed parsing core config. Path: ${bold(relative(process.cwd(), filepath))}. \n${
      getConfigParsErrorMsg(error, cfg as CoreConfig)}`);
  }

  return coreConfigSchema.parse(data);
}

function getConfigParsErrorMsg(error: Error, rawConfig: Partial<CoreConfig> = {}) {
  const errorJson = JSON.parse(error.message.trim()) as ZodIssue[];

  if (errorJson.length > 0) {
    return errorJson.map((error) => {
      return parseZodIssue(error, {prefix: '', prefixSeparator: '-'}).message;
    }).join('\n');
  }

  return error.message.trim();
}

export async function autoloadRc(tsconfig?: string): Promise<CoreConfig> {
  // eslint-disable-next-line functional/no-let
  let ext = '';
  // eslint-disable-next-line functional/no-loop-statements
  for (const extension of SUPPORTED_CONFIG_FILE_FORMATS) {
    const path = `${CONFIG_FILE_NAME}.${extension}`;
    const exists = await fileExists(path);

    if (exists) {
      ext = extension;
      break;
    }
  }

  if (!ext) {
    throw new Error(
      `No file ${CONFIG_FILE_NAME}.(${SUPPORTED_CONFIG_FILE_FORMATS.join(
        '|',
      )}) present in ${process.cwd()}`,
    );
  }

  return readRcByPath(
    join(process.cwd(), `${CONFIG_FILE_NAME}.${ext}`),
    tsconfig,
  );
}
