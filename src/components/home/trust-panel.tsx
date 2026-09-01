import {
  Files,
  SealCheck,
  ShieldCheck,
  Stack,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';

const SOURCE_LEVELS: ReadonlyArray<{
  readonly label: string;
  readonly description: string;
  readonly icon: Icon;
}> = [
  {
    label: 'Official source',
    description: 'Published by the developer, publisher, or platform source.',
    icon: SealCheck,
  },
  {
    label: 'Multiple sources',
    description:
      'Checked across more than one independent source, with differences stated.',
    icon: Stack,
  },
  {
    label: 'Single source',
    description:
      'Supported by one identified source, with the limitation shown clearly.',
    icon: Files,
  },
];

type TrustPanelProps = {
  readonly publishedGuideCount: number;
};

export function TrustPanel({ publishedGuideCount }: TrustPanelProps) {
  const coverageCopy =
    publishedGuideCount > 0
      ? `All ${publishedGuideCount} published guides carry a source label and update date.`
      : 'Every published guide carries a source label and update date.';

  return (
    <section aria-labelledby="trust-panel-title" className="shell-container py-10 md:py-12">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div
          className="rounded-[var(--radius-surface)] border-2 border-[var(--border-strong)] p-6 shadow-[6px_6px_0_var(--shadow-color)] lg:col-span-5 lg:p-8"
          style={{
            background:
              'color-mix(in srgb, var(--highlight) 42%, var(--surface))',
          }}
        >
          <ShieldCheck
            aria-hidden="true"
            className="text-[var(--foreground-strong)]"
            size={42}
            weight="bold"
          />
          <h2
            className="mt-4 text-balance font-display text-3xl leading-tight tracking-[-0.025em] text-[var(--foreground-strong)] md:text-4xl"
            id="trust-panel-title"
          >
            Know what supports each answer
          </h2>
          <p className="mt-4 text-lg font-bold text-[var(--foreground-strong)]">
            KOTAMON.com is an independent fan-made reference.
          </p>
          <p className="mt-3 font-semibold text-[var(--foreground-strong)]">
            It is not affiliated with or endorsed by KotaMota Games or Polnoch.
            {` ${coverageCopy}`}
          </p>
        </div>

        <dl className="m-0 lg:col-span-7">
          {SOURCE_LEVELS.map((level) => {
            const LevelIcon = level.icon;

            return (
              <div
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 border-b-2 border-[var(--border)] py-4 first:pt-0 last:border-b-0 last:pb-0 md:grid-cols-[auto_12rem_minmax(0,1fr)] md:items-center"
                key={level.label}
              >
                <span className="inline-grid size-11 place-items-center rounded-full bg-accent text-[var(--accent-foreground)]">
                  <LevelIcon aria-hidden="true" size={23} weight="bold" />
                </span>
                <dt className="font-display text-lg leading-tight text-[var(--foreground-strong)]">
                  {level.label}
                </dt>
                <dd className="col-start-2 m-0 max-w-[52ch] font-semibold text-[var(--muted-foreground)] md:col-start-3">
                  {level.description}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
