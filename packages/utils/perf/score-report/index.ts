import {bench, summary, compact, run} from 'mitata';
import type {Report} from '@code-pushup/models';
import {scoreReport} from '../../src/lib/reports/scoring';
import {scoreReportOptimized0} from './optimized0';
import {scoreReportOptimized1} from './optimized1';
import {scoreReportOptimized2} from './optimized2';
import {scoreReportOptimized3} from './optimized3';

// ==============================================================

type MinimalReportOptions = {
    numAuditsP1?: number;
    numAuditsP2?: number;
    numGroupRefs2?: number;
};

const PROCESS_ARGUMENT_NUM_AUDITS_P1 = Number.parseInt(
    process.argv
        .find(arg => arg.startsWith('--numAudits1'))
        ?.split('=')
        .at(-1) ?? '0',
    10,
);
const PROCESS_ARGUMENT_NUM_AUDITS_P2 = Number.parseInt(
    process.argv
        .find(arg => arg.startsWith('--numAudits2'))
        ?.split('=')
        .at(-1) ?? '0',
    10,
);
const PROCESS_ARGUMENT_NUM_GROUPS_P2 = Number.parseInt(
    process.argv
        .find(arg => arg.startsWith('--numGroupRefs2'))
        ?.split('=')
        .at(-1) ?? '0',
    10,
);

// eslint-disable-next-line import/no-named-as-default-member

const AUDIT_PREFIX = 'a-';
const GROUP_PREFIX = 'g:';
const PLUGIN_PREFIX = 'p.';
const SLUG_PLUGIN_P1 = PLUGIN_PREFIX + 1;
const AUDIT_P1_PREFIX = AUDIT_PREFIX + SLUG_PLUGIN_P1;
const SLUG_PLUGIN_P2 = PLUGIN_PREFIX + 2;
const AUDIT_P2_PREFIX = AUDIT_PREFIX + SLUG_PLUGIN_P2;
const GROUP_P2_PREFIX = GROUP_PREFIX + SLUG_PLUGIN_P2;
const NUM_AUDITS_P1 = PROCESS_ARGUMENT_NUM_AUDITS_P1 || 27;
const NUM_AUDITS_P2 = PROCESS_ARGUMENT_NUM_AUDITS_P2 || 18;
const NUM_GROUPS_P2 = PROCESS_ARGUMENT_NUM_GROUPS_P2 || NUM_AUDITS_P2 / 2;

// eslint-disable-next-line max-lines-per-function
function minimalReport(opt?: MinimalReportOptions): Report {
    const numAuditsP1 = opt?.numAuditsP1 ?? NUM_AUDITS_P1;
    const numAuditsP2 = opt?.numAuditsP2 ?? NUM_AUDITS_P2;
    const numGroupRefs2 = opt?.numGroupRefs2 ?? NUM_GROUPS_P2;

    const date = new Date();

    return {
        date: date.toISOString(),
        packageName: 'perf-benchmark',
        version: '0',
        commit: {
            date: date,
            message: 'perf: benchmark score report',
            author: 'me',
            hash: 'mock_hash',
        },
        duration: 0,
        categories: [
            {
                slug: 'c1_',
                title: 'Category 1',
                refs: Array.from({length: numAuditsP1}).map((_, idx) => ({
                    type: 'audit',
                    plugin: SLUG_PLUGIN_P1,
                    slug: `${AUDIT_P1_PREFIX}${idx}`,
                    weight: 1,
                })),
                isBinary: false,
            },
            {
                slug: 'c2_',
                title: 'Category 2',
                refs: Array.from({length: numAuditsP2}).map((_, idx) => ({
                    type: 'audit',
                    plugin: SLUG_PLUGIN_P2,
                    slug: `${AUDIT_P2_PREFIX}${idx}`,
                    weight: 1,
                })),
                isBinary: false,
            },
        ],
        plugins: [
            {
                date: '2022-01-01',
                duration: 0,
                slug: SLUG_PLUGIN_P1,
                title: 'Plugin 1',
                icon: 'slug',
                audits: Array.from({length: numAuditsP1}).map((_, idx) => ({
                    value: 0,
                    slug: `${AUDIT_P1_PREFIX}${idx}`,
                    title: 'Default Title',
                    score: 0.1,
                })),
                groups: [],
            },
            {
                date: '2022-01-01',
                duration: 0,
                slug: SLUG_PLUGIN_P2,
                title: 'Plugin 2',
                icon: 'slug',
                audits: Array.from({length: numAuditsP2}).map((_, idx) => ({
                    value: 0,
                    slug: `${AUDIT_P2_PREFIX}${idx}`,
                    title: 'Default Title',
                    score: 0.1,
                })),
                groups: [
                    {
                        title: 'Group 1',
                        slug: GROUP_P2_PREFIX + 1,
                        refs: Array.from({length: numGroupRefs2}).map((_, idx) => ({
                            slug: `${AUDIT_P2_PREFIX}${idx}`,
                            weight: 1,
                        })),
                    },
                ],
            },
        ],
    };
}

// ======================================

// Add tests
summary(() => {
  compact(() => {
        bench('scoreReportCurrentImplementation', () => scoreReport(minimalReport()));
        bench('scoreReportOptimized0', () => scoreReportOptimized0(minimalReport()));
        bench('scoreReportOptimized1', () => scoreReportOptimized1(minimalReport()));
        bench('scoreReportOptimized2', () => scoreReportOptimized2(minimalReport()));
        bench('scoreReportOptimized3', () => scoreReportOptimized3(minimalReport()));
    })
})
await run();
