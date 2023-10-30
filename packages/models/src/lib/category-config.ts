import { z } from 'zod';
import {
  metaSchema,
  scorableSchema,
  slugSchema,
  weightedRefSchema,
} from './implementation/schemas';
import { errorItems, hasDuplicateStrings } from './implementation/utils';

export const categoryConfigRefSchema = weightedRefSchema(
  'Weighted references to audits and/or groups for the category',
  'Slug of an audit or group (depending on `type`)',
).merge(
  z.object({
    type: z.enum(['audit', 'group'], {
      description:
        'Discriminant for reference kind, affects where `slug` is looked up',
    }),
    plugin: slugSchema(
      'Plugin slug (plugin should contain referenced audit or group)',
    ),
  }),
);
export type CategoryConfigRef = z.infer<typeof categoryConfigRefSchema>;

export const categoryConfigSchema = scorableSchema(
  'Category with a score calculated from audits and groups from various plugins',
  categoryConfigRefSchema,
  getDuplicateRefsInCategoryMetrics,
  duplicateRefsInCategoryMetricsErrorMsg,
)
  .merge(
    metaSchema({
      titleDescription: 'Category Title',
      docsUrlDescription: 'Category docs URL',
      descriptionDescription: 'Category description',
      description: 'Meta info for category',
    }),
  )
  .merge(
    z.object({
      isBinary: z
        .boolean({
          description:
            'Is this a binary category (i.e. only a perfect score considered a "pass")?',
        })
        .optional(),
    }),
  );

export type CategoryConfig = z.infer<typeof categoryConfigSchema>;

// helper for validator: categories have unique refs to audits or groups
export function duplicateRefsInCategoryMetricsErrorMsg(
  metrics: CategoryConfigRef[],
) {
  const duplicateRefs = getDuplicateRefsInCategoryMetrics(metrics);
  return `In the categories, the following audit or group refs are duplicates: ${errorItems(
    duplicateRefs,
  )}`;
}
function getDuplicateRefsInCategoryMetrics(metrics: CategoryConfigRef[]) {
  return hasDuplicateStrings(
    metrics.map(({ slug, type, plugin }) => `${type} :: ${plugin} / ${slug}`),
  );
}
