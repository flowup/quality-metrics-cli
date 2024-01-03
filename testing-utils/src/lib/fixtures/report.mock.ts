import { type Report } from '../../../../packages/models/src';

export const MINIMAL_REPORT_MOCK = {
  packageName: '@code-pushup/core',
  version: '0.0.1',
  date: '2023-08-16T09:00:00.000Z',
  duration: 666,
  categories: [],
  plugins: [],
} satisfies Report;

export const REPORT_MOCK = {
  packageName: '@code-pushup/core',
  version: '1.0.0',
  date: '2023-08-16T09:00:00.000Z',
  duration: 666,
  categories: [
    {
      slug: 'test-results',
      title: 'Test results',
      refs: [
        {
          type: 'audit',
          slug: 'cypress-e2e-tests',
          plugin: 'cypress',
          weight: 3,
        },
        {
          type: 'audit',
          slug: 'cypress-component-tests',
          plugin: 'cypress',
          weight: 1,
        },
      ],
    },
    {
      slug: 'bug-prevention',
      title: 'Bug prevention',
      refs: [
        {
          type: 'group',
          slug: 'typescript-eslint',
          plugin: 'eslint',
          weight: 8,
        },
        {
          type: 'audit',
          slug: 'eslint-functional',
          plugin: 'eslint',
          weight: 1,
        },
        {
          type: 'audit',
          slug: 'eslint-jest-consistent-naming',
          plugin: 'eslint',
          weight: 1,
        },
        {
          type: 'audit',
          slug: 'eslint-cypress',
          plugin: 'eslint',
          weight: 0,
        },
      ],
    },
  ],
  plugins: [
    {
      slug: 'cypress',
      title: 'Cypress results',
      date: '2023-08-16T09:00:00.000Z',
      duration: 42,
      icon: 'cypress',
      audits: [
        {
          slug: 'cypress-e2e-tests',
          title: 'Cypress e2e tests',
          value: 5,
          score: 0.5,
        },
        {
          slug: 'cypress-component-tests',
          title: 'Cypress component tests',
          value: 0,
          score: 1,
        },
      ],
    },
    {
      slug: 'eslint',
      title: 'ESLint',
      date: '2023-08-16T09:00:00.000Z',
      duration: 624,
      icon: 'eslint',
      groups: [
        {
          slug: 'typescript-eslint',
          title: 'TypeScript ESLint',
          refs: [
            {
              slug: 'typescript-eslint-typing',
              weight: 3,
            },
            {
              slug: 'typescript-eslint-enums',
              weight: 1,
            },
            {
              slug: 'typescript-eslint-experimental',
              weight: 0,
            },
          ],
        },
      ],
      audits: [
        {
          slug: 'typescript-eslint-typing',
          title: 'Type checking',
          value: 1,
          score: 0,
        },
        {
          slug: 'typescript-eslint-enums',
          title: 'Enumeration value checks',
          value: 0,
          score: 1,
        },
        {
          slug: 'typescript-eslint-experimental',
          title: 'TypeScript experimental checks',
          value: 1,
          score: 0,
        },
        {
          slug: 'eslint-functional',
          title: 'Functional principles',
          value: 1,
          score: 0,
        },
        {
          slug: 'eslint-jest-consistent-naming',
          title: 'Consistent naming',
          value: 0,
          score: 1,
        },
        {
          slug: 'eslint-cypress',
          title: 'Cypress rules',
          value: 0,
          score: 1,
        },
      ],
    },
  ],
} satisfies Report;
