import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import { describe, expect, it } from 'vitest';

import { LocationChecklist } from '@/components/content/location-checklist';
import { getEntry } from '@/content/registry';

type ChecklistPage = ComponentType<{
  components: { LocationChecklist: typeof LocationChecklist };
}>;

function renderEntry(slug: string) {
  const entry = getEntry('en', slug);
  expect(entry, `${slug} must be registered as public content`).toBeDefined();

  const Component = entry?.Component as ChecklistPage;
  render(<Component components={{ LocationChecklist }} />);

  return entry;
}

describe('Task 12 public content', () => {
  it.each([
    ['collectibles/figurines', 'multi-source', 'P1'],
    ['collectibles/audiotapes', 'multi-source', 'P1'],
    ['game/where-to-play', 'official', 'P2'],
    ['game/artists', 'single-source', 'P2'],
  ] as const)('registers %s with its required source boundary', (slug, status, priority) => {
    const entry = getEntry('en', slug);

    expect(entry).toMatchObject({
      slug,
      sourceStatus: status,
      priority,
      updatedAt: '2026-08-25',
      draft: false,
      locale: 'en',
    });
    expect(entry?.sources.every((source) => source.url.startsWith('https://'))).toBe(true);
  });

  it('renders the figurine route as a spoiler-controlled ordered checklist', () => {
    renderEntry('collectibles/figurines');

    expect(screen.getByText('Show the figurine route checklist')).toBeVisible();
    expect(screen.getByRole('list', { name: 'Figurine route order' })).toBeInTheDocument();
    expect(screen.getByText(/not twelve fixed map points/i)).toBeVisible();
  });

  it('separates audiotape achievement requirements from current issue reports', () => {
    renderEntry('collectibles/audiotapes');

    expect(screen.getByRole('heading', { name: 'Achievement requirements' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Current issue reports' })).toBeVisible();
    expect(screen.getByText(/patch-sensitive/i)).toBeVisible();
    expect(screen.getByText('Show the audiotape collection loop')).toBeVisible();
  });

  it('keeps where-to-play claims inside the verified Steam boundary', () => {
    const entry = renderEntry('game/where-to-play');
    const copy = document.body.textContent ?? '';

    expect(copy).toContain('Steam App ID 4294490');
    expect(copy).toContain('KotaMota Games');
    expect(copy).toContain('Polnoch');
    expect(copy).toContain('August 20, 2026');
    expect(copy).toContain('does not claim another platform or announce a future port');
    expect(entry?.sources.every((source) => source.kind === 'official')).toBe(true);
  });

  it('states that individual artist names require authoritative in-game credits', () => {
    const entry = renderEntry('game/artists');
    const copy = document.body.textContent ?? '';

    expect(copy).toContain(
      'Individual artist names are not established by the supplied sources.',
    );
    expect(copy).toMatch(/in-game credits/i);
    expect(copy).toContain('KotaMota Games');
    expect(entry?.sources).toHaveLength(1);
  });
});
