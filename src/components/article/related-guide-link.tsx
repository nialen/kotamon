'use client';

import type { ReactNode } from 'react';

declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      parameters: Record<string, string>,
    ) => void;
  }
}

type RelatedGuideLinkProps = {
  readonly children: ReactNode;
  readonly href: string;
  readonly linkText: string;
  readonly sourcePage: string;
};

export function RelatedGuideLink({
  children,
  href,
  linkText,
  sourcePage,
}: RelatedGuideLinkProps) {
  return (
    <a
      href={href}
      onClick={() => {
        window.gtag?.('event', 'related_guide_click', {
          source_page: sourcePage,
          target_page: href,
          section: 'related_guides',
          link_text: linkText,
        });
      }}
    >
      {children}
    </a>
  );
}
