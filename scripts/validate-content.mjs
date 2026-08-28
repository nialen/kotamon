#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { isDeepStrictEqual } from 'node:util';

import matter from 'gray-matter';
import { createVitest } from 'vitest/node';

const EXPECTED_MDX_COUNT = 20;
const EXPECTED_PUBLIC_ROUTE_COUNT = 21;
const PUBLISHABLE_SOURCE_STATUSES = new Set([
  'official',
  'multi-source',
  'single-source',
]);
const FORBIDDEN_ROUTE_PATTERN =
  /(?:^|\/)(?:mods?|cheats?|trainers?|codes?)(?:\/|$)|^\/(?:ru|zh|es)(?:\/|$)/i;

function pathArgument(args, name, fallback) {
  const index = args.indexOf(name);
  if (index === -1) {
    return fallback;
  }

  const requestedPath = args[index + 1];
  if (!requestedPath) {
    throw new Error(`Missing path after ${name}`);
  }

  return path.resolve(process.cwd(), requestedPath);
}

async function collectFiles(directory, extension) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectFiles(entryPath, extension);
      }
      return entry.isFile() && entry.name.endsWith(extension) ? [entryPath] : [];
    }),
  );

  return files.flat().sort((left, right) => left.localeCompare(right, 'en'));
}

function printablePath(projectRoot, filePath) {
  return path.relative(projectRoot, filePath).split(path.sep).join('/');
}

function entryWithoutComponent(entry) {
  const frontmatter = { ...entry };
  delete frontmatter.Component;
  return frontmatter;
}

function entryKey(entry) {
  return `${entry.locale}:${entry.slug}`;
}

function routeFor(entry) {
  return `/${entry.locale}/${entry.slug}`;
}

function compareRouteSets(expected, actual, label, errors) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);

  for (const route of expectedSet) {
    if (!actualSet.has(route)) {
      errors.push({
        path: 'src/content/routes.ts',
        message: `${label} is missing ${route}`,
      });
    }
  }

  for (const route of actualSet) {
    if (!expectedSet.has(route)) {
      errors.push({
        path: 'src/content/routes.ts',
        message: `${label} contains unapproved route ${route}`,
      });
    }
  }
}

function assertBuildSnapshot(snapshot) {
  if (
    !snapshot ||
    !Array.isArray(snapshot.allEntries) ||
    !Array.isArray(snapshot.publicEntries) ||
    !Array.isArray(snapshot.publicRoutes)
  ) {
    throw new Error(
      'Build snapshot must contain allEntries, publicEntries, and publicRoutes arrays',
    );
  }

  return snapshot;
}

async function loadBuildInterfaces(buildRoot, buildSnapshotPath) {
  const vitest = await createVitest('test', {
    root: buildRoot,
    config: path.join(buildRoot, 'vitest.config.ts'),
    watch: false,
    run: true,
    passWithNoTests: true,
    silent: true,
  });

  try {
    const { contentEntrySchema } = await vitest.import(
      path.join(buildRoot, 'src/content/schema.ts'),
    );

    let buildSnapshot;
    if (buildSnapshotPath) {
      buildSnapshot = assertBuildSnapshot(
        JSON.parse(await fs.readFile(buildSnapshotPath, 'utf8')),
      );
    } else {
      const [{ contentRegistry }, { PUBLIC_ROUTES }] = await Promise.all([
        vitest.import(path.join(buildRoot, 'src/content/registry.ts')),
        vitest.import(path.join(buildRoot, 'src/content/routes.ts')),
      ]);
      buildSnapshot = {
        allEntries: contentRegistry.allEntries.map(entryWithoutComponent),
        publicEntries: contentRegistry.publicEntries.map(entryWithoutComponent),
        publicRoutes: [...PUBLIC_ROUTES],
      };
    }

    return {
      allEntries: buildSnapshot.allEntries,
      publicEntries: buildSnapshot.publicEntries,
      publicRoutes: buildSnapshot.publicRoutes,
      validateFrontmatter: (frontmatter) => contentEntrySchema.safeParse(frontmatter),
    };
  } finally {
    await vitest.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const projectRoot = pathArgument(args, '--root', process.cwd());
  const buildRoot = pathArgument(args, '--build-root', projectRoot);
  const buildSnapshotPath = pathArgument(args, '--build-snapshot', undefined);
  const contentRoot = path.join(projectRoot, 'content');
  const errors = [];
  let mdxFiles = [];
  const rawEntries = [];

  try {
    mdxFiles = await collectFiles(contentRoot, '.mdx');
  } catch (error) {
    errors.push({
      path: 'content',
      message: `Unable to read content directory: ${error.message}`,
    });
  }

  for (const filePath of mdxFiles) {
    const relativePath = printablePath(projectRoot, filePath);
    try {
      const rawMdx = await fs.readFile(filePath, 'utf8');
      const parsed = matter(rawMdx);
      rawEntries.push({ filePath: relativePath, frontmatter: parsed.data });
    } catch (error) {
      errors.push({
        path: relativePath,
        message: `Unable to parse MDX frontmatter: ${error.message}`,
      });
    }
  }

  let buildInterfaces;
  try {
    buildInterfaces = await loadBuildInterfaces(buildRoot, buildSnapshotPath);
  } catch (error) {
    errors.push({
      path: 'src/content/registry.ts',
      message: `Unable to load build registry: ${error.message}`,
    });
  }

  const validRawEntries = [];
  if (buildInterfaces) {
    for (const rawEntry of rawEntries) {
      const { locale, slug } = rawEntry.frontmatter;
      if (typeof locale === 'string' && typeof slug === 'string') {
        const candidateRoute = `/${locale}/${slug}`;
        if (FORBIDDEN_ROUTE_PATTERN.test(candidateRoute)) {
          errors.push({
            path: rawEntry.filePath,
            message: `Forbidden public route ${candidateRoute}`,
          });
        }
      }

      const result = buildInterfaces.validateFrontmatter(rawEntry.frontmatter);
      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({
            path: rawEntry.filePath,
            message: `${issue.path.join('.') || 'frontmatter'}: ${issue.message}`,
          });
        }
        continue;
      }

      validRawEntries.push({ ...rawEntry, frontmatter: result.data });
    }
  }

  const rawEntryPaths = new Map();
  for (const rawEntry of validRawEntries) {
    const key = entryKey(rawEntry.frontmatter);
    const existingPath = rawEntryPaths.get(key);
    if (existingPath) {
      errors.push({
        path: rawEntry.filePath,
        message: `Duplicate locale and slug; first declared in ${existingPath}`,
      });
    } else {
      rawEntryPaths.set(key, rawEntry.filePath);
    }

    if (rawEntry.frontmatter.draft) {
      errors.push({
        path: rawEntry.filePath,
        message: 'Draft content is not allowed in the approved public set',
      });
    }

    if (!PUBLISHABLE_SOURCE_STATUSES.has(rawEntry.frontmatter.sourceStatus)) {
      errors.push({
        path: rawEntry.filePath,
        message: `Unsupported public sourceStatus ${rawEntry.frontmatter.sourceStatus}`,
      });
    }
  }

  const rawEntriesByKey = new Map(
    validRawEntries.map((rawEntry) => [entryKey(rawEntry.frontmatter), rawEntry]),
  );

  for (const rawEntry of validRawEntries) {
    const { frontmatter } = rawEntry;
    const seenRelated = new Map();

    for (const [index, slug] of (frontmatter.related ?? []).entries()) {
      if (slug === frontmatter.slug) {
        errors.push({
          path: rawEntry.filePath,
          message: `related.${index} must not reference the entry itself`,
        });
        continue;
      }

      const previousIndex = seenRelated.get(slug);
      if (previousIndex !== undefined) {
        errors.push({
          path: rawEntry.filePath,
          message: `related.${index} ${slug} duplicates related.${previousIndex}`,
        });
        continue;
      }
      seenRelated.set(slug, index);

      const target = rawEntriesByKey.get(`${frontmatter.locale}:${slug}`);
      if (!target) {
        errors.push({
          path: rawEntry.filePath,
          message: `related.${index} ${slug} is missing from locale ${frontmatter.locale}`,
        });
        continue;
      }

      if (target.frontmatter.draft) {
        errors.push({
          path: rawEntry.filePath,
          message: `related.${index} ${slug} points to draft entry ${target.filePath}, which is not public`,
        });
        continue;
      }

      if (target.frontmatter.sourceStatus === 'unverified') {
        errors.push({
          path: rawEntry.filePath,
          message: `related.${index} ${slug} points to unverified entry ${target.filePath}, which is not public`,
        });
        continue;
      }

      if (!PUBLISHABLE_SOURCE_STATUSES.has(target.frontmatter.sourceStatus)) {
        errors.push({
          path: rawEntry.filePath,
          message: `related.${index} ${slug} points to nonpublic entry ${target.filePath}`,
        });
      }
    }
  }

  if (mdxFiles.length !== EXPECTED_MDX_COUNT) {
    errors.push({
      path: 'content',
      message: `Expected ${EXPECTED_MDX_COUNT} MDX files, found ${mdxFiles.length}`,
    });
  }

  if (buildInterfaces) {
    if (buildInterfaces.allEntries.length !== EXPECTED_MDX_COUNT) {
      errors.push({
        path: 'src/content/registry.ts',
        message: `Expected ${EXPECTED_MDX_COUNT} build registry entries, found ${buildInterfaces.allEntries.length}`,
      });
    }

    if (buildInterfaces.publicEntries.length !== EXPECTED_MDX_COUNT) {
      errors.push({
        path: 'src/content/registry.ts',
        message: `Expected ${EXPECTED_MDX_COUNT} public registry entries, found ${buildInterfaces.publicEntries.length}`,
      });
    }

    if (buildInterfaces.publicRoutes.length !== EXPECTED_PUBLIC_ROUTE_COUNT) {
      errors.push({
        path: 'src/content/routes.ts',
        message: `Expected ${EXPECTED_PUBLIC_ROUTE_COUNT} public routes, found ${buildInterfaces.publicRoutes.length}`,
      });
    }

    for (const route of buildInterfaces.publicRoutes) {
      if (FORBIDDEN_ROUTE_PATTERN.test(route)) {
        errors.push({
          path: 'src/content/routes.ts',
          message: `Forbidden public route ${route}`,
        });
      }
    }

    const rawByKey = new Map(
      validRawEntries.map((entry) => [entryKey(entry.frontmatter), entry]),
    );
    const registryByKey = new Map(
      buildInterfaces.allEntries.map((entry) => [entryKey(entry), entry]),
    );

    for (const [key, rawEntry] of rawByKey) {
      const registryEntry = registryByKey.get(key);
      if (!registryEntry) {
        errors.push({
          path: rawEntry.filePath,
          message: 'Raw MDX entry is missing from the build registry',
        });
      } else if (!isDeepStrictEqual(rawEntry.frontmatter, registryEntry)) {
        errors.push({
          path: rawEntry.filePath,
          message: 'Raw MDX frontmatter differs from the build registry entry',
        });
      }
    }

    for (const [key, registryEntry] of registryByKey) {
      if (!rawByKey.has(key)) {
        errors.push({
          path: 'src/content/registry.ts',
          message: `Registry entry has no matching raw MDX file: ${routeFor(registryEntry)}`,
        });
      }
    }

    const rawRoutes = validRawEntries.map((entry) => routeFor(entry.frontmatter));
    const registryRoutes = buildInterfaces.publicEntries.map(routeFor);
    compareRouteSets(rawRoutes, registryRoutes, 'Build registry', errors);
    compareRouteSets(
      ['/en', ...rawRoutes],
      buildInterfaces.publicRoutes,
      'Public route manifest',
      errors,
    );
  }

  const categoryCounts = new Map();
  for (const entry of validRawEntries) {
    categoryCounts.set(
      entry.frontmatter.category,
      (categoryCounts.get(entry.frontmatter.category) ?? 0) + 1,
    );
  }
  const categories = [...categoryCounts]
    .sort(([left], [right]) => left.localeCompare(right, 'en'))
    .map(([category, count]) => `${category}: ${count}`)
    .join(', ');

  console.log(`Content entries: ${mdxFiles.length}`);
  console.log(
    `Registry entries: ${buildInterfaces ? buildInterfaces.allEntries.length : 0}`,
  );
  console.log(
    `Public routes: ${buildInterfaces ? buildInterfaces.publicRoutes.length : 0}`,
  );
  console.log(`Categories: ${categories || 'none'}`);
  console.log(`Errors: ${errors.length}`);

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`- ${error.path}: ${error.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Content validation passed.');
}

await main();
