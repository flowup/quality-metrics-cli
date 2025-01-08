import type { StyleLintTargetObject } from './config.js';

export type RcPath = Required<Pick<StyleLintTargetObject, 'stylelintrc'>>;
