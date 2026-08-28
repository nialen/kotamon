import Image from 'next/image';
import type { ReactNode } from 'react';

import { GuideLink } from '@/components/home/home-section';
import type { PublicNavigationItem } from '@/content/routes';
import { SITE } from '@/lib/site';

type HomeScreenshotProps = {
  readonly src: string;
  readonly alt: string;
  readonly title: string;
  readonly height?: number;
  readonly children: ReactNode;
  readonly href: PublicNavigationItem['href'];
  readonly linkLabel: string;
};

export function HomeScreenshot({ src, alt, title, height = 720, children, href, linkLabel }: HomeScreenshotProps) {
  return (
    <figure className="m-0 flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-surface)] border-2 border-[var(--border-strong)] bg-[var(--surface)]">
      <Image alt={alt} className="block h-auto w-full shrink-0" height={height} loading="lazy" sizes="(max-width: 1023px) calc(100vw - 2rem), 46vw" src={src} width={1280} />
      <figcaption className="flex flex-1 flex-col gap-3 border-t-2 border-[var(--border)] p-5 md:p-6">
        <h3 className="font-display text-xl leading-snug text-[var(--foreground-strong)]">{title}</h3>
        <p className="font-semibold text-[var(--muted-foreground)]">{children}</p>
        <div className="mt-auto space-y-3">
          <GuideLink href={href}>{linkLabel}</GuideLink>
          <p className="text-xs font-semibold text-[var(--muted-foreground)]">
            Screenshot: <a className="underline" href={SITE.steamUrl}>official Steam store</a>. Interface details may vary by version.
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
