import { ui } from '@code-pushup/utils';
import { executeRunner } from './lib/runner';

ui().logger.warning('~~ bin.ts execute runner ');
await executeRunner();
