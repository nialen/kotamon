import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';
import matter from 'gray-matter';

import { contentRegistry } from '@/content/registry';
import { PUBLIC_ROUTES } from '@/content/routes';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, '../..');
const temporaryDirectories: string[] = [];

const approvedRoutes = [
  '/en',
  '/en/guides/gameplay',
  '/en/guides/card-repair',
  '/en/guides/foil-cards',
  '/en/guides/cereal-boxes',
  '/en/guides/save-not-working',
  '/en/guides/secret-location',
  '/en/cards',
  '/en/collectibles/figurines',
  '/en/collectibles/audiotapes',
  '/en/achievements',
  '/en/game/where-to-play',
  '/en/game/artists',
] as const;

function runNodeScript(script: string, args: string[] = []) {
  return spawnSync(process.execPath, [path.join(projectRoot, script), ...args], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
}

type FixtureEntry = Record<string, unknown> & {
  title: string;
  slug: string;
  locale: string;
  sourceStatus: string;
  draft: boolean;
};

type BuildSnapshot = {
  allEntries: FixtureEntry[];
  publicEntries: FixtureEntry[];
  publicRoutes: string[];
};

const baselineEntries = contentRegistry.allEntries.map((entry) => {
  const frontmatter = { ...entry } as Record<string, unknown>;
  delete frontmatter.Component;
  return frontmatter as FixtureEntry;
});

function createValidatorFixture(
  mutate: (fixture: {
    rawEntries: FixtureEntry[];
    snapshot: BuildSnapshot;
  }) => void,
) {
  const fixtureRoot = mkdtempSync(path.join(os.tmpdir(), 'kotamon-validator-'));
  temporaryDirectories.push(fixtureRoot);
  const contentRoot = path.join(fixtureRoot, 'content');
  mkdirSync(contentRoot, { recursive: true });

  const rawEntries = structuredClone(baselineEntries);
  const snapshot: BuildSnapshot = {
    allEntries: structuredClone(baselineEntries),
    publicEntries: structuredClone(baselineEntries),
    publicRoutes: [...approvedRoutes],
  };
  mutate({ rawEntries, snapshot });

  rawEntries.forEach((entry, index) => {
    const filename = `entry-${String(index + 1).padStart(2, '0')}.mdx`;
    writeFileSync(
      path.join(contentRoot, filename),
      matter.stringify('\n', entry),
      'utf8',
    );
  });

  const snapshotPath = path.join(fixtureRoot, 'build-snapshot.json');
  writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf8');

  const result = runNodeScript('scripts/validate-content.mjs', [
    '--root',
    fixtureRoot,
    '--build-root',
    projectRoot,
    '--build-snapshot',
    snapshotPath,
  ]);

  return { result, output: `${result.stdout}${result.stderr}` };
}

function expectValidatorFailure(
  fixture: ReturnType<typeof createValidatorFixture>,
  expectedMessages: string[],
) {
  expect(fixture.result.status, fixture.output).toBe(1);
  for (const message of expectedMessages) {
    expect(fixture.output).toContain(message);
  }
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('public content manifest', () => {
  it('publishes exactly the 13 approved English routes', () => {
    expect(PUBLIC_ROUTES).toEqual(approvedRoutes);
    expect(PUBLIC_ROUTES).not.toEqual(
      expect.arrayContaining([
        expect.stringMatching(/mods|cheats|trainers|codes|\/ru|\/zh|\/es/i),
      ]),
    );
  });

  it('keeps the 12 registry entries aligned with the article routes', () => {
    const registryRoutes = contentRegistry.publicEntries.map(
      ({ locale, slug }) => `/${locale}/${slug}`,
    );

    expect(contentRegistry.allEntries).toHaveLength(12);
    expect(registryRoutes).toEqual(approvedRoutes.slice(1));
  });

  it('validates raw MDX against the build registry', () => {
    const result = runNodeScript('scripts/validate-content.mjs');
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status, output).toBe(0);
    expect(result.stdout).toContain('Content entries: 12');
    expect(result.stdout).toContain('Public routes: 13');
  });

  it('rejects schema errors with the raw MDX path', () => {
    const fixture = createValidatorFixture(({ rawEntries }) => {
      rawEntries[0].title = '';
    });

    expectValidatorFailure(fixture, ['content/entry-01.mdx: title:']);
  });

  it('rejects draft content with the raw MDX path', () => {
    const fixture = createValidatorFixture(({ rawEntries }) => {
      rawEntries[0].draft = true;
    });

    expectValidatorFailure(fixture, [
      'content/entry-01.mdx: Draft content is not allowed',
    ]);
  });

  it('rejects unsupported public source statuses with the raw MDX path', () => {
    const fixture = createValidatorFixture(({ rawEntries }) => {
      rawEntries[0].sourceStatus = 'unverified';
    });

    expectValidatorFailure(fixture, [
      'content/entry-01.mdx: Unsupported public sourceStatus unverified',
    ]);
  });

  it('rejects publishable raw MDX supported only by unverified source kinds', () => {
    const fixture = createValidatorFixture(({ rawEntries, snapshot }) => {
      const unsupportedSources = [
        {
          label: 'Unverified post',
          url: 'https://example.com/post',
          kind: 'unverified',
        },
      ];
      rawEntries[0].sources = unsupportedSources;
      snapshot.allEntries[0].sources = structuredClone(unsupportedSources);
      snapshot.publicEntries[0].sources = structuredClone(unsupportedSources);
    });

    expectValidatorFailure(fixture, [
      'content/entry-01.mdx: sources: Publishable content requires at least one source whose kind is not unverified',
    ]);
  });

  it('rejects duplicate locale and slug pairs with both raw MDX paths', () => {
    const fixture = createValidatorFixture(({ rawEntries }) => {
      rawEntries[1].slug = rawEntries[0].slug;
    });

    expectValidatorFailure(fixture, [
      'content/entry-02.mdx: Duplicate locale and slug; first declared in content/entry-01.mdx',
    ]);
  });

  it('rejects missing, self, and duplicate related slugs at their originating raw paths', () => {
    const missing = createValidatorFixture(({ rawEntries, snapshot }) => {
      rawEntries[0].related = ['guides/missing'];
      snapshot.allEntries[0].related = ['guides/missing'];
      snapshot.publicEntries[0].related = ['guides/missing'];
    });
    expectValidatorFailure(missing, [
      'content/entry-01.mdx: related.0 guides/missing is missing from locale en',
    ]);

    const self = createValidatorFixture(({ rawEntries, snapshot }) => {
      rawEntries[0].related = [rawEntries[0].slug];
      snapshot.allEntries[0].related = [rawEntries[0].slug];
      snapshot.publicEntries[0].related = [rawEntries[0].slug];
    });
    expectValidatorFailure(self, [
      'content/entry-01.mdx: related.0 must not reference the entry itself',
    ]);

    const duplicate = createValidatorFixture(({ rawEntries, snapshot }) => {
      rawEntries[0].related = [rawEntries[1].slug, rawEntries[1].slug];
      snapshot.allEntries[0].related = [rawEntries[1].slug, rawEntries[1].slug];
      snapshot.publicEntries[0].related = [
        rawEntries[1].slug,
        rawEntries[1].slug,
      ];
    });
    expectValidatorFailure(duplicate, [
      'content/entry-01.mdx: related.1 guides/card-repair duplicates related.0',
    ]);
  });

  it('rejects related slugs that point to draft or unverified raw entries', () => {
    const draft = createValidatorFixture(({ rawEntries, snapshot }) => {
      rawEntries[0].related = [rawEntries[1].slug];
      rawEntries[1].draft = true;
      snapshot.allEntries[0].related = [rawEntries[1].slug];
      snapshot.allEntries[1].draft = true;
      snapshot.publicEntries = snapshot.publicEntries.filter(
        (entry) => entry.slug !== rawEntries[1].slug,
      );
    });
    expectValidatorFailure(draft, [
      'content/entry-01.mdx: related.0 guides/card-repair points to draft entry content/entry-02.mdx, which is not public',
    ]);

    const unverified = createValidatorFixture(({ rawEntries, snapshot }) => {
      rawEntries[0].related = [rawEntries[1].slug];
      rawEntries[1].sourceStatus = 'unverified';
      snapshot.allEntries[0].related = [rawEntries[1].slug];
      snapshot.allEntries[1].sourceStatus = 'unverified';
      snapshot.publicEntries = snapshot.publicEntries.filter(
        (entry) => entry.slug !== rawEntries[1].slug,
      );
    });
    expectValidatorFailure(unverified, [
      'content/entry-01.mdx: related.0 guides/card-repair points to unverified entry content/entry-02.mdx, which is not public',
    ]);
  });

  it('rejects forbidden route families and locales with raw MDX paths', () => {
    const fixture = createValidatorFixture(({ rawEntries }) => {
      rawEntries[0].slug = 'mods';
      rawEntries[1].locale = 'ru';
    });

    expectValidatorFailure(fixture, [
      'content/entry-01.mdx: Forbidden public route /en/mods',
      'content/entry-02.mdx: Forbidden public route /ru/guides/card-repair',
    ]);
  });

  it('rejects raw frontmatter drift from the build registry', () => {
    const fixture = createValidatorFixture(({ rawEntries }) => {
      rawEntries[0].title = 'Changed only in the raw fixture';
    });

    expectValidatorFailure(fixture, [
      'content/entry-01.mdx: Raw MDX frontmatter differs from the build registry entry',
    ]);
  });

  it('rejects missing and unapproved routes in the public manifest', () => {
    const fixture = createValidatorFixture(({ snapshot }) => {
      snapshot.publicRoutes = snapshot.publicRoutes.map((route) =>
        route === '/en/game/artists' ? '/en/guides/extra-guide' : route,
      );
    });

    expectValidatorFailure(fixture, [
      'src/content/routes.ts: Public route manifest is missing /en/game/artists',
      'src/content/routes.ts: Public route manifest contains unapproved route /en/guides/extra-guide',
    ]);
  });

  it('rejects visible dash characters and placeholder domains with paths', () => {
    const fixtureRoot = mkdtempSync(path.join(os.tmpdir(), 'kotamon-residue-'));
    temporaryDirectories.push(fixtureRoot);
    mkdirSync(path.join(fixtureRoot, 'src'), { recursive: true });
    mkdirSync(path.join(fixtureRoot, 'content'), { recursive: true });
    mkdirSync(path.join(fixtureRoot, 'public'), { recursive: true });
    writeFileSync(
      path.join(fixtureRoot, 'src', 'page.tsx'),
      "export const copy = 'Create Next App — Vercel – lorem ipsum example.com';\n",
      'utf8',
    );

    const result = runNodeScript('scripts/check-template-residue.mjs', [
      '--root',
      fixtureRoot,
    ]);
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status, output).toBe(1);
    expect(output).toContain('src/page.tsx:1');
    expect(output).toContain('Create Next App');
    expect(output).toContain('Vercel');
    expect(output).toContain('lorem ipsum');
    expect(output).toContain('visible em dash');
    expect(output).toContain('visible en dash');
    expect(output).toContain('example.com');
  });

  it('limits source-field exemptions to explicitly allowed hosts', () => {
    const fixtureRoot = mkdtempSync(path.join(os.tmpdir(), 'kotamon-residue-'));
    temporaryDirectories.push(fixtureRoot);
    mkdirSync(path.join(fixtureRoot, 'src'), { recursive: true });
    mkdirSync(path.join(fixtureRoot, 'content'), { recursive: true });
    mkdirSync(path.join(fixtureRoot, 'public'), { recursive: true });
    writeFileSync(
      path.join(fixtureRoot, 'content', 'sources.mdx'),
      [
        'url: https://store.steampowered.com/news/vercel/example.com',
        'url: https://not-allowed.invalid/vercel/example.com',
        'source: https://store.steampowered.com/news/vercel/example.com',
        '',
      ].join('\n'),
      'utf8',
    );

    const result = runNodeScript('scripts/check-template-residue.mjs', [
      '--root',
      fixtureRoot,
    ]);
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status, output).toBe(1);
    expect(output).not.toContain('content/sources.mdx:1:');
    expect(output).toContain('content/sources.mdx:2:');
    expect(output).toContain('content/sources.mdx:3:');
    expect(output).toContain('Vercel starter reference');
    expect(output).toContain('example.com placeholder domain');
  });

  it('finds no starter residue in public website sources', () => {
    const result = runNodeScript('scripts/check-template-residue.mjs');
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status, output).toBe(0);
    expect(result.stdout).toContain('Template residue findings: 0');
  });
});
