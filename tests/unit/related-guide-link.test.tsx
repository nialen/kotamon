import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import Link from 'next/link';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RelatedGuideLink } from '@/components/article/related-guide-link';

afterEach(() => {
  delete window.gtag;
});

function clickWithoutLeavingTheDocument(link: HTMLElement) {
  let defaultPreventedByComponent: boolean | undefined;

  document.addEventListener(
    'click',
    (event) => {
      defaultPreventedByComponent = event.defaultPrevented;
      event.preventDefault();
    },
    { once: true },
  );
  fireEvent.click(link);

  return defaultPreventedByComponent;
}

describe('RelatedGuideLink', () => {
  it('uses the Next.js Link component for client-side navigation', () => {
    const element = RelatedGuideLink({
      children: 'Card Repair',
      href: '/en/guides/card-repair',
      linkText: 'Card Repair',
      sourcePage: '/en/guides/gameplay',
    });

    expect(element.type).toBe(Link);
  });

  it('emits the expected related-guide event exactly once when clicked', () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    render(
      <RelatedGuideLink
        href="/en/guides/card-repair"
        linkText="Card Repair"
        sourcePage="/en/guides/gameplay"
      >
        Card Repair
      </RelatedGuideLink>,
    );

    expect(
      clickWithoutLeavingTheDocument(screen.getByRole('link', { name: 'Card Repair' })),
    ).toBe(false);

    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith('event', 'related_guide_click', {
      source_page: '/en/guides/gameplay',
      target_page: '/en/guides/card-repair',
      section: 'related_guides',
      link_text: 'Card Repair',
    });
  });

  it('keeps the link functional when gtag is unavailable', () => {
    render(
      <RelatedGuideLink
        href="/en/guides/card-repair"
        linkText="Card Repair"
        sourcePage="/en/guides/gameplay"
      >
        Card Repair
      </RelatedGuideLink>,
    );

    const link = screen.getByRole('link', { name: 'Card Repair' });

    expect(link).toHaveAttribute('href', '/en/guides/card-repair');
    expect(clickWithoutLeavingTheDocument(link)).toBe(false);
  });
});
