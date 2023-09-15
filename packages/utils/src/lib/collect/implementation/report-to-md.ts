import { CoreConfig, Report } from '@quality-metrics/models';
import { NEW_LINE, headline, style, li, table, details, link } from './md/';
import {
  countWeightedRefs,
  sumRefs,
  reportHeadlineText,
  reportOverviewTableHeaders,
} from './utils';

export function reportToMd(report: Report, config: CoreConfig): string {
  // header section
  let md = reportToHeaderSection() + NEW_LINE;

  // meta section
  md += reportToMetaSection(report, config) + NEW_LINE + NEW_LINE;

  // overview section
  md += reportToOverviewSection(report, config) + NEW_LINE + NEW_LINE;

  // details section
  md += reportToDetailSection(report, config) + NEW_LINE;

  // footer section
  md += 'Made with ❤️ by [code-pushup.dev](code-pushup.dev)';
  return md;
}

function reportToHeaderSection(): string {
  return headline(reportHeadlineText) + NEW_LINE;
}

function reportToMetaSection(report: Report, config: CoreConfig): string {
  const { date, duration, version, packageName } = report;
  const { plugins } = config;
  return (
    `---` +
    NEW_LINE +
    `_Package Name: ${packageName}_` +
    NEW_LINE +
    `_Version: ${version}_` +
    NEW_LINE +
    `_Commit: feat(cli): add logic for markdown report - 7eba125ad5643c2f90cb21389fc3442d786f43f9_` +
    NEW_LINE +
    `_Date: ${new Date(date).toString()}_` +
    NEW_LINE +
    `_Duration: ${duration}ms_` +
    NEW_LINE +
    `_Plugins: ${plugins?.length}_` +
    NEW_LINE +
    `_Audits: ${plugins?.reduce(
      (sum, { audits }) => sum + audits.length,
      0,
    )}_` +
    NEW_LINE +
    `---` +
    NEW_LINE
  );
}

function reportToOverviewSection(report: Report, config: CoreConfig): string {
  const { categories } = config;
  const tableContent: string[][] = [
    reportOverviewTableHeaders,
    ...categories.map(({ title, refs }) => [
      title,
      sumRefs(refs).toString(),
      refs.length.toString() + '/' + countWeightedRefs(refs),
    ]),
  ];
  return table(tableContent);
}

function reportToDetailSection(report: Report, config: CoreConfig): string {
  let md = '';
  const { categories, plugins } = config;

  categories.forEach(category => {
    const { title, refs } = category;

    md += style(`${title} ${sumRefs(refs)}`) + NEW_LINE;

    md +=
      refs
        .map(
          ({ slug: auditSlugInCategoryRefs, weight, plugin: pluginSlug }) => {
            const audit = plugins
              .find(({ meta }) => meta.slug === pluginSlug)
              ?.audits.find(
                ({ slug: auditSlugInPluginAudits }) =>
                  auditSlugInPluginAudits === auditSlugInCategoryRefs,
              );

            if (audit) {
              let content = `${audit.description}` + NEW_LINE;
              if (audit.docsUrl) {
                content += link(audit.docsUrl, 'Documentation') + NEW_LINE;
              }
              return li(details(`${audit.title} (${weight})`, content));
            } else {
              // this should never happen
              throw new Error(`No audit found for ${auditSlugInCategoryRefs}`);
            }
          },
        )
        .join(NEW_LINE) + NEW_LINE;
  });

  return md;
}
