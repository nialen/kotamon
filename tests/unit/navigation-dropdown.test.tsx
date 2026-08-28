import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SiteHeader } from '@/components/site/site-header';

vi.mock('next/navigation', () => ({ usePathname: () => '/en/guides/gameplay' }));
afterEach(cleanup);

it('opens a desktop disclosure using an icon button and closes it on Escape', () => {
  render(<SiteHeader />);
  const nav = screen.getByRole('navigation', { name: 'Primary navigation' });
  const button = within(nav).getByRole('button', { name: 'Toggle Guides submenu' });
  expect(button.querySelector('svg')).not.toBeNull();
  expect(button).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');
  const link = within(nav).getByRole('link', { name: 'Beginner Guide' });
  expect(link).toHaveAttribute('href', '/en/guides/beginner-guide');
  link.focus();
  fireEvent.keyDown(link, { key: 'Escape' });
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(button).toHaveFocus();
});

it('dismisses an open desktop submenu with Escape while focus stays outside navigation', () => {
  render(<SiteHeader />);
  const nav = screen.getByRole('navigation', { name: 'Primary navigation' });
  const button = within(nav).getByRole('button', { name: 'Toggle Guides submenu' });
  fireEvent.click(button);
  expect(document.body).toHaveFocus();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(document.body).toHaveFocus();
});

it('shows the requested submenu order and only one open desktop group', () => {
  render(<SiteHeader />);
  const nav = screen.getByRole('navigation', { name: 'Primary navigation' });
  for (const [label, names] of [
    ['Guides', ['Beginner Guide', 'Gameplay', 'Money', 'Upgrades', 'Save Help']],
    ['Cards', ['Cards Hub', 'Card Repair', 'Foil Cards', 'Cereal Boxes']],
    ['Collectibles', ['Collectibles Hub', 'Secret Location', 'Figurines', 'Audiotapes']],
    ['Game', ['Game Hub', 'Where to Play', 'System Requirements', 'Artists', 'Updates']],
  ] as const) {
    const button = within(nav).getByRole('button', { name: `Toggle ${label} submenu` });
    fireEvent.click(button);
    const panel = document.getElementById(button.getAttribute('aria-controls')!)!;
    expect(within(panel).getAllByRole('link').map(link => link.textContent)).toEqual(names);
    expect(nav.querySelectorAll('button[aria-expanded="true"]')).toHaveLength(1);
  }
  expect(within(nav).queryByRole('button', { name: /Achievements submenu/ })).toBeNull();
  fireEvent.pointerDown(document.body);
  expect(nav.querySelectorAll('button[aria-expanded="true"]')).toHaveLength(0);
});

it('closes a desktop submenu when keyboard focus leaves the navigation', () => {
  render(<SiteHeader />);
  const nav = screen.getByRole('navigation', { name: 'Primary navigation' });
  const button = within(nav).getByRole('button', { name: 'Toggle Cards submenu' });
  fireEvent.click(button);
  fireEvent.blur(nav, { relatedTarget: document.body });
  expect(button).toHaveAttribute('aria-expanded', 'false');
});

it('collapses mobile sections and reveals another section with its icon control', () => {
  render(<SiteHeader />);
  fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
  const nav = screen.getByRole('navigation', { name: 'Mobile navigation' });
  const guides = within(nav).getByRole('button', { name: 'Toggle Guides submenu' });
  expect(guides).toHaveAttribute('aria-expanded', 'true');
  expect(within(nav).getByRole('link', { name: 'Gameplay' })).toHaveAttribute('aria-current', 'page');
  const game = within(nav).getByRole('button', { name: 'Toggle Game submenu' });
  expect(game).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(game);
  expect(within(nav).getByRole('link', { name: 'System Requirements' })).toBeVisible();
  expect(guides).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(game);
  expect(within(nav).queryByRole('link', { name: 'System Requirements' })).toBeNull();
  expect(within(nav).getByRole('link', { name: 'Guides' })).toHaveAttribute('href', '/en/guides');
});
