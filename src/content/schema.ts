import { z } from 'zod';

export const SOURCE_STATUSES = [
  'official',
  'multi-source',
  'single-source',
  'unverified',
] as const;

export type SourceStatus = (typeof SOURCE_STATUSES)[number];

const relativeSlugSchema = z
  .string()
  .min(1)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/,
    'Slug must use canonical lowercase slash-separated path segments',
  );

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Date must be a valid ISO date');

export const contentEntrySchema = z
  .object({
    title: z.string().min(1),
    seoTitle: z.string().min(1).optional(),
    pageType: z.enum(['guide', 'hub']).optional(),
    description: z.string().min(1),
    slug: relativeSlugSchema,
    category: z.string().min(1),
    updatedAt: isoDateSchema,
    sourceStatus: z.enum(SOURCE_STATUSES),
    draft: z.boolean(),
    locale: z.literal('en'),
    priority: z.enum(['P0', 'P1', 'P2']).optional(),
    related: z.array(relativeSlugSchema).optional(),
    relatedHeading: z.string().trim().min(1).max(80).optional(),
    sources: z
      .array(
        z.object({
          label: z.string().min(1),
          url: z
            .url()
            .refine((url) => url.startsWith('https://'), 'Source URL must use HTTPS'),
          kind: z.enum(SOURCE_STATUSES),
        }),
      )
      .min(1),
  })
  .superRefine((entry, context) => {
    const isPublishable = !entry.draft && entry.sourceStatus !== 'unverified';
    const hasSupportedSource = entry.sources.some(
      (source) => source.kind !== 'unverified',
    );

    if (isPublishable && !hasSupportedSource) {
      context.addIssue({
        code: 'custom',
        message:
          'Publishable content requires at least one source whose kind is not unverified',
        path: ['sources'],
      });
    }
  });

export type ContentEntry = z.infer<typeof contentEntrySchema>;
