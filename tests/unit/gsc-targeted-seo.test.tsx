import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import type { MDXComponents } from 'mdx/types';
import { afterEach, describe, expect, it } from 'vitest';

import { getEntry } from '@/content/registry';
import { buildArticleMetadata } from '@/seo/metadata';
import { useMDXComponents } from '../../mdx-components';

afterEach(cleanup);

function ContentUnderTest({
  Content,
}: {
  readonly Content: ComponentType<{ components: MDXComponents }>;
}) {
  return <Content components={useMDXComponents()} />;
}

function renderContent(slug: string) {
  const entry = getEntry('en', slug);
  expect(entry, `${slug} must remain public`).toBeDefined();

  const Content = entry?.Component as ComponentType<{ components: MDXComponents }>;
  const result = render(<ContentUnderTest Content={Content} />);

  return { ...result, entry: entry! };
}

describe('GSC-targeted page intent coverage', () => {
  it('answers artist queries without inventing individual credits', () => {
    const { container, entry } = renderContent('game/artists');
    const copy = container.textContent ?? '';

    expect(buildArticleMetadata(entry).title).toEqual({
      absolute: 'KOTAMON Artists, Card Illustrators & Artwork Credits',
    });
    expect(entry.title).toBe('KOTAMON Artists and Verified Credits');
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Who created the KOTAMON card artwork?',
      }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Who are the KOTAMON card artists?' }),
    ).toBeVisible();
    expect(copy).toContain(
      'Publicly available official sources currently do not provide a complete individual artist list.',
    );
    expect(copy).toContain('KotaMota Games');
    expect(copy).not.toContain('No artist exists.');
    expect(copy).not.toContain('No illustrator is credited anywhere.');
    expect(container.querySelector('a[href="/en/game"]')).not.toBeNull();
    expect(container.querySelector('a[href="/en/cards"]')).not.toBeNull();
  });

  it('identifies the latest official patch and its guide impact', () => {
    const { container } = renderContent('updates');
    const copy = container.textContent ?? '';

    expect(screen.getByRole('heading', { name: 'Latest KOTAMON Patch' })).toBeVisible();
    expect(copy).toContain('August 27, 2026');
    expect(copy).toContain('CARD UPGRADES and a ton of bug fixes');
    expect(
      screen.getByRole('heading', { name: 'What is the latest KOTAMON patch?' }),
    ).toBeVisible();
    for (const href of [
      '/en/cards',
      '/en/guides/cereal-boxes',
      '/en/guides/save-not-working',
    ]) {
      expect(container.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
  });

  it('leads with the unverified save location before troubleshooting steps', () => {
    const { container, entry } = renderContent('guides/save-not-working');
    const headings = [...container.querySelectorAll('h2')].map((heading) => heading.textContent);
    const copy = container.textContent ?? '';

    expect(headings[0]).toBe('KOTAMON Save File Location');
    expect(entry.description).toMatch(/save file location/i);
    expect(copy).toContain(
      'The exact local save path has not been reliably confirmed in the official sources currently available.',
    );
    expect(screen.getByRole('heading', { name: 'Does KOTAMON Use Steam Cloud?' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'How to Back Up Your KOTAMON Save' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'How to Recover a KOTAMON Save' })).toBeVisible();
    expect(container.querySelector('a[href="/en/updates"]')).not.toBeNull();
  });

  it('answers secret queries without claiming multiple confirmed secrets', () => {
    const { container } = renderContent('guides/secret-location');
    const headings = [...container.querySelectorAll('h2')].map((heading) => heading.textContent);
    const copy = container.textContent ?? '';

    expect(headings[0]).toBe('Where is the KOTAMON secret location?');
    expect(copy).toContain(
      'This guide currently covers the confirmed hidden surprise and the related community-reported secret location.',
    );
    expect(screen.getByRole('heading', { name: 'Other KOTAMON secrets' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Are there multiple secrets in KOTAMON?' })).toBeVisible();
    expect(copy).not.toMatch(/multiple confirmed (?:secret|hidden) locations/i);
    for (const href of [
      '/en/collectibles/figurines',
      '/en/collectibles/audiotapes',
      '/en/achievements',
    ]) {
      expect(container.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
  });
});
