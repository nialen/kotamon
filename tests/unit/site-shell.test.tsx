import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Breadcrumbs } from '@/components/site/breadcrumbs';
import { MobileNav } from '@/components/site/mobile-nav';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { SourceStatus } from '@/components/site/source-status';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { UpdatedAt } from '@/components/site/updated-at';
import {
  PUBLIC_NAVIGATION_GROUPS,
  PUBLIC_ROUTES,
} from '@/content/routes';

const routeState = vi.hoisted(() => ({ pathname: '/en' }));
vi.mock('next/navigation', () => ({ usePathname: () => routeState.pathname }));

afterEach(() => {
  routeState.pathname = '/en';
  document.documentElement.removeAttribute('data-theme');
  window.localStorage.clear();
  vi.restoreAllMocks();
});

it.each([
  ['/en/cards', 'Cards', 'page'],
  ['/en/guides/card-repair', 'Cards', 'location'],
  ['/en/guides/foil-cards', 'Cards', 'location'],
  ['/en/guides/cereal-boxes', 'Cards', 'location'],
  ['/en/guides/gameplay', 'Gameplay', 'page'],
  ['/en/guides/save-not-working', 'Gameplay', 'location'],
  ['/en/guides/secret-location', 'Collectibles', 'location'],
  ['/en/collectibles/audiotapes', 'Collectibles', 'location'],
  ['/en/achievements', 'Achievements', 'page'],
  ['/en/game/artists', 'Game', 'location'],
])('marks the correct desktop section for %s', (pathname, label, current) => {
  routeState.pathname = pathname;
  render(<SiteHeader />);
  const nav = screen.getByRole('navigation', { name: 'Primary navigation' });
  expect(within(nav).getByRole('link', { name: label })).toHaveAttribute('aria-current', current);
  expect(nav.querySelectorAll('[aria-current]')).toHaveLength(1);
});

it('does not incorrectly select an article section on the homepage', () => {
  render(<SiteHeader />);
  expect(screen.getByRole('navigation', { name: 'Primary navigation' }).querySelector('[aria-current]')).toBeNull();
});

it('updates the selected mobile page when the route changes', () => {
  routeState.pathname = '/en/guides/foil-cards';
  const { rerender } = render(<MobileNav groups={PUBLIC_NAVIGATION_GROUPS} />);
  fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
  expect(screen.getByRole('link', { name: 'Foil cards' })).toHaveAttribute('aria-current', 'page');
  routeState.pathname = '/en/game/artists';
  rerender(<MobileNav groups={PUBLIC_NAVIGATION_GROUPS} />);
  expect(screen.getByRole('link', { name: 'Artists' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: 'Foil cards' })).not.toHaveAttribute('aria-current');
});

it('renders the exact legal disclaimer', () => {
  render(<SiteFooter />);

  expect(
    screen.getByText(
      'KOTAMON.com is an independent fan-made website and is not affiliated with or endorsed by KotaMota Games or Polnoch. KOTAMON and related game assets are trademarks and/or copyrighted materials of their respective owners.',
    ),
  ).toBeInTheDocument();
});

it('renders source status as visible text', () => {
  render(<SourceStatus status="multi-source" />);

  expect(screen.getByText('Multiple sources')).toBeVisible();
});

it('keeps every approved route in the public navigation groups', () => {
  const groupedRoutes = PUBLIC_NAVIGATION_GROUPS.flatMap((group) =>
    group.items.map((item) => item.href),
  );

  expect(['/en', ...groupedRoutes]).toEqual([...PUBLIC_ROUTES]);
});

it('renders a compact branded header with primary navigation', () => {
  const { container } = render(<SiteHeader />);

  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /KOTAMON Wiki & Guide/i })).toHaveAttribute(
    'href',
    '/en',
  );
  const brandMark = container.querySelector('.site-brand__mark');
  const brandImage = brandMark?.querySelector('img');

  expect(brandMark).toHaveTextContent('K');
  expect(brandImage).toHaveAttribute('src', '/brand/icon-192.png');
  expect(brandImage).toHaveAttribute('width', '38');
  expect(brandImage).toHaveAttribute('height', '38');
  expect(brandImage).toHaveAttribute('alt', 'KOTAMON logo');
  expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
});

describe('mobile navigation disclosure', () => {
  const groups = [
    {
      label: 'Guides',
      items: [{ label: 'Gameplay', href: '/en/guides/gameplay' }],
    },
  ] as const;

  it('opens from a button and closes on Escape with focus returned', () => {
    render(<MobileNav groups={groups} />);
    const trigger = screen.getByRole('button', { name: 'Open navigation' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Gameplay' })).toBeVisible();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('closes when a navigation link or the outside surface is selected', () => {
    render(<MobileNav groups={groups} />);
    const trigger = screen.getByRole('button', { name: 'Open navigation' });

    fireEvent.click(trigger);
    const link = screen.getByRole('link', { name: 'Gameplay' });
    link.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(link);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

it('persists a manual theme choice from the resolved document theme', () => {
  document.documentElement.dataset.theme = 'light';
  render(<ThemeToggle />);
  const toggle = screen.getByRole('button', { name: 'Switch to dark theme' });

  expect(toggle).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(toggle);

  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  expect(window.localStorage.getItem('kotamon-theme')).toBe('dark');
  expect(toggle).toHaveAccessibleName('Switch to light theme');
  expect(toggle).toHaveAttribute('aria-pressed', 'true');
});

it('still applies a theme when local storage rejects the write', () => {
  document.documentElement.dataset.theme = 'light';
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Storage blocked', 'SecurityError');
  });
  render(<ThemeToggle />);

  expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
});

it('marks the current breadcrumb and formats the update date for English readers', () => {
  render(
    <>
      <Breadcrumbs
        items={[
          { label: 'Guides', href: '/en/guides/gameplay' },
          { label: 'Card Repair' },
        ]}
      />
      <UpdatedAt updatedAt="2026-08-25" />
    </>,
  );

  expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
  expect(screen.getByText('Card Repair')).toHaveAttribute('aria-current', 'page');
  expect(screen.getByText('Updated August 25, 2026')).toBeVisible();
});
