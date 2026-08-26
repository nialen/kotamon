import type { ComponentType } from 'react';

import { contentModules } from '@/content/entries';
import {
  contentEntrySchema,
  type ContentEntry,
} from '@/content/schema';

export type { ContentEntry, SourceStatus } from '@/content/schema';
export type MdxModule = {
  default: ComponentType;
  frontmatter: unknown;
  sourcePath?: string;
};
export type RegisteredEntry = ContentEntry & { Component: ComponentType };
export type ContentRegistry = {
  allEntries: RegisteredEntry[];
  publicEntries: RegisteredEntry[];
};

type ParsedModule = {
  entry: RegisteredEntry;
  sourcePath: string;
};

function entryKey(entry: Pick<ContentEntry, 'locale' | 'slug'>) {
  return `${entry.locale}:${entry.slug}`;
}

function isPublicEntry(entry: ContentEntry) {
  return !entry.draft && entry.sourceStatus !== 'unverified';
}

function relatedError(
  sourcePath: string,
  index: number,
  slug: string,
  message: string,
) {
  return new Error(
    `Invalid related slug in ${sourcePath} at related.${index}: ${slug}${message}`,
  );
}

export function createRegistry(modules: readonly MdxModule[]): ContentRegistry {
  const parsedModules: ParsedModule[] = modules.map(
    ({ default: Component, frontmatter, sourcePath }, index) => {
    const diagnosticPath = sourcePath ?? `module ${index}`;
    const parsed = contentEntrySchema.safeParse(frontmatter);

    if (!parsed.success) {
      throw new Error(
        `Invalid content frontmatter in ${diagnosticPath}: ${parsed.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('; ')}`,
      );
    }

      return {
        entry: { ...parsed.data, Component },
        sourcePath: diagnosticPath,
      };
    },
  );

  const modulesByKey = new Map<string, ParsedModule>();
  for (const parsedModule of parsedModules) {
    const key = entryKey(parsedModule.entry);
    const existing = modulesByKey.get(key);
    if (existing) {
      throw new Error(
        `${parsedModule.sourcePath}: Duplicate content entry for ${parsedModule.entry.locale}/${parsedModule.entry.slug}; first declared in ${existing.sourcePath}`,
      );
    }
    modulesByKey.set(key, parsedModule);
  }

  for (const { entry, sourcePath } of parsedModules) {
    const seenRelated = new Map<string, number>();

    for (const [index, slug] of (entry.related ?? []).entries()) {
      if (slug === entry.slug) {
        throw relatedError(
          sourcePath,
          index,
          slug,
          ' must not reference the entry itself',
        );
      }

      const previousIndex = seenRelated.get(slug);
      if (previousIndex !== undefined) {
        throw relatedError(
          sourcePath,
          index,
          slug,
          ` duplicates related.${previousIndex}`,
        );
      }
      seenRelated.set(slug, index);

      const target = modulesByKey.get(`${entry.locale}:${slug}`);
      if (!target) {
        throw relatedError(
          sourcePath,
          index,
          slug,
          ` is missing from locale ${entry.locale}`,
        );
      }

      if (target.entry.draft) {
        throw relatedError(
          sourcePath,
          index,
          slug,
          ` points to draft entry ${target.sourcePath}, which is not public`,
        );
      }

      if (target.entry.sourceStatus === 'unverified') {
        throw relatedError(
          sourcePath,
          index,
          slug,
          ` points to unverified entry ${target.sourcePath}, which is not public`,
        );
      }

      if (!isPublicEntry(target.entry)) {
        throw relatedError(
          sourcePath,
          index,
          slug,
          ` points to nonpublic entry ${target.sourcePath}`,
        );
      }
  }
  }

  const allEntries = parsedModules.map(({ entry }) => entry);

  return {
    allEntries,
    publicEntries: allEntries.filter(isPublicEntry),
  };
}

export const contentRegistry = createRegistry(contentModules);

export function createRegistryAccessors(registry: ContentRegistry): {
  getPublicEntries: () => RegisteredEntry[];
  getEntry: (locale: ContentEntry['locale'], slug: string) => RegisteredEntry | undefined;
  getRelatedEntries: (entry: RegisteredEntry) => RegisteredEntry[];
  getArticleStaticParams: () => Array<{ locale: 'en'; slug: string[] }>;
} {
  const publicEntriesByKey = new Map(
    registry.publicEntries.map((entry) => [entryKey(entry), entry]),
  );

  return {
    getPublicEntries: () => registry.publicEntries,
    getEntry: (locale, slug) => publicEntriesByKey.get(`${locale}:${slug}`),
    getRelatedEntries: (entry) =>
      (entry.related ?? []).map((slug) => {
        const related = publicEntriesByKey.get(`${entry.locale}:${slug}`);
        if (!related) {
          throw new Error(
            `Content registry invariant failed for ${entry.locale}/${entry.slug}: related slug ${slug} is not public`,
          );
        }
        return related;
      }),
    getArticleStaticParams: () =>
      registry.publicEntries.map(({ locale, slug }) => ({
        locale,
        slug: slug.split('/'),
      })),
  };
}

const contentAccessors = createRegistryAccessors(contentRegistry);

export const getPublicEntries = contentAccessors.getPublicEntries;
export const getEntry = contentAccessors.getEntry;
export const getRelatedEntries = contentAccessors.getRelatedEntries;
export const getArticleStaticParams = contentAccessors.getArticleStaticParams;
