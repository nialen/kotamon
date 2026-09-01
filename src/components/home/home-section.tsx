import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import type { ReactNode } from 'react';

import type { PublicNavigationItem } from '@/content/routes';

export const HOME_HEADING =
  'm-0 text-balance font-display text-3xl leading-tight tracking-[-0.025em] text-[var(--foreground-strong)] md:text-4xl';

export function HomeSection({
  id, title, children, className = '',
}: {
  readonly id: string;
  readonly title: string;
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <section aria-labelledby={id} className={`shell-container py-10 md:py-12 ${className}`}>
      <h2 className={HOME_HEADING} id={id}>{title}</h2>
      {children}
    </section>
  );
}

export function GuideLink({
  href, children,
}: {
  readonly href: PublicNavigationItem['href'];
  readonly children: ReactNode;
}) {
  return (
    <Link className="inline-flex items-center gap-2 font-extrabold text-[var(--foreground-strong)] underline decoration-accent decoration-2 underline-offset-4 hover:text-accent" href={href}>
      {children}
      <ArrowRight aria-hidden="true" className="shrink-0" size={18} weight="bold" />
    </Link>
  );
}
