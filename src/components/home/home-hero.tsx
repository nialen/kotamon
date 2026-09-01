import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import Image from 'next/image';
import Link from 'next/link';

import { SITE } from '@/lib/site';

export function HomeHero() {
  return (
    <section aria-labelledby="home-title" className="shell-container">
      <div className="grid grid-cols-1 items-center gap-8 py-6 md:grid-cols-12 md:gap-10 md:py-8">
        <div className="md:col-span-5 md:pr-4">
          <h1
            className="max-w-[12ch] text-balance font-display text-[clamp(2.45rem,11vw,4.5rem)] leading-[0.98] tracking-[-0.045em] text-[var(--foreground-strong)] md:text-[clamp(3.3rem,5.1vw,5rem)]"
            id="home-title"
          >
            {SITE.name}
          </h1>
          <p className="mt-4 max-w-[34rem] text-lg font-bold leading-relaxed text-[var(--muted-foreground)] md:text-xl">
            <span>{SITE.positioning}</span>{' '}
            Explore cards, collectibles, achievements and practical game guides.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              className="inline-flex min-h-12 items-center gap-2 whitespace-nowrap rounded-full border-2 border-[var(--border-strong)] bg-accent px-5 py-3 font-extrabold text-[var(--accent-foreground)] no-underline shadow-[3px_3px_0_var(--shadow-color)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--shadow-color)] active:translate-y-px"
              href="/en/guides/gameplay"
            >
              Start with gameplay
              <ArrowRight aria-hidden="true" size={20} weight="bold" />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center whitespace-nowrap rounded-full border-2 border-[var(--border-strong)] bg-[var(--surface)] px-5 py-3 font-extrabold text-[var(--foreground-strong)] no-underline hover:-translate-y-0.5 hover:bg-[var(--surface-muted)] active:translate-y-px"
              href="/en/cards"
            >
              Browse cards
            </Link>
          </div>
        </div>

        <figure className="m-0 overflow-hidden rounded-[var(--radius-surface)] border-2 border-[var(--border-strong)] bg-[var(--surface)] shadow-[8px_8px_0_var(--shadow-color)] md:col-span-7">
          <Image
            alt="KOTAMON gameplay outside Jenny's Office, showing the dump, a garbage bag and the collection UI"
            className="block aspect-video h-auto w-full object-contain"
            height={900}
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 767px) calc(100vw - 2rem), 58vw"
            src="/images/home/kotamon-gameplay.webp"
            width={1600}
          />
          <figcaption className="border-t-2 border-[var(--border-strong)] px-4 py-3 text-sm font-semibold text-[var(--muted-foreground)]">
            Gameplay screenshot from the{' '}
            <a href={SITE.steamUrl}>official Steam store</a>.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
