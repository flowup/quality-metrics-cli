import { stylelintPlugin } from './lib/stylelint-plugin.js';

export {
  getAudits,
  getGroups,
  getCategoryRefsFromGroups,
  getCategoryRefsFromAudits,
} from './lib/utils.js';

export default stylelintPlugin;
export type { StyleLintPluginConfig } from './lib/config.js';
