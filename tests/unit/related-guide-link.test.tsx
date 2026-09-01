import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RelatedGuideLink } from '@/components/article/related-guide-link';

afterEach(() => {
  delete window.gtag;
});

describe('RelatedGuideLink', () => {
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

    fireEvent.click(screen.getByRole('link', { name: 'Card Repair' }));

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
    expect(fireEvent.click(link)).toBe(true);
  });
});
