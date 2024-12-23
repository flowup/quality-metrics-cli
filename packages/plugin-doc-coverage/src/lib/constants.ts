import type { Audit, Group } from '@code-pushup/models';
import type { AuditSlug } from './models.js';

export const PLUGIN_SLUG = 'doc-coverage';

export const AUDITS_MAP: Record<AuditSlug, Audit> = {
  'classes-coverage': {
    slug: 'classes-coverage',
    title: 'Classes coverage',
    description: 'Documentation coverage of classes',
  },
  'methods-coverage': {
    slug: 'methods-coverage',
    title: 'Methods coverage',
    description: 'Documentation coverage of methods',
  },
  'functions-coverage': {
    slug: 'functions-coverage',
    title: 'Functions coverage',
    description: 'Coverage of functions',
  },
  'interfaces-coverage': {
    slug: 'interfaces-coverage',
    title: 'Interfaces coverage',
    description: 'Coverage of interfaces',
  },
  'variables-coverage': {
    slug: 'variables-coverage',
    title: 'Variables coverage',
    description: 'Coverage of variables',
  },
  'properties-coverage': {
    slug: 'properties-coverage',
    title: 'Properties coverage',
    description: 'Coverage of properties',
  },
  'types-coverage': {
    slug: 'types-coverage',
    title: 'Types coverage',
    description: 'Coverage of types',
  },
  'enums-coverage': {
    slug: 'enums-coverage',
    title: 'Enums coverage',
    description: 'Coverage of enums',
  },
} as const;

export const groups: Group[] = [
  {
    slug: 'documentation-coverage',
    title: 'Documentation coverage',
    description: 'Documentation coverage',
    refs: Object.keys(AUDITS_MAP).map(slug => ({
      slug,
      weight: [
        'classes-coverage',
        'functions-coverage',
        'methods-coverage',
      ].includes(slug)
        ? 2
        : 1,
    })),
  },
];
