import { ArrowRight, ShieldWarning } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export function IssueNotice() {
  return (
    <aside aria-labelledby="save-protection-title" className="shell-container">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-[var(--radius-notice)] border-2 border-[var(--border-strong)] border-l-[0.65rem] border-l-accent bg-[var(--surface)] p-4 shadow-[4px_4px_0_var(--shadow-color)] md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-5 md:p-5">
        <ShieldWarning
          aria-hidden="true"
          className="mt-0.5 text-[var(--foreground-strong)] md:mt-0"
          size={30}
          weight="bold"
        />
        <div>
          <h2
            className="m-0 font-display text-base leading-tight text-[var(--foreground-strong)]"
            id="save-protection-title"
          >
            Protect your save before troubleshooting
          </h2>
          <p className="mt-1 max-w-[70ch] text-sm font-semibold leading-relaxed text-[var(--muted-foreground)] md:text-base">
            Recent official fixes may not cover every report. Back up your save
            before trying recovery steps.
          </p>
        </div>
        <Link
          className="col-start-2 inline-flex w-fit items-center gap-2 font-extrabold text-[var(--foreground-strong)] underline decoration-accent decoration-2 hover:text-accent md:col-start-auto"
          href="/en/guides/save-not-working"
        >
          Read the save guide
          <ArrowRight aria-hidden="true" size={18} weight="bold" />
        </Link>
      </div>
    </aside>
  );
}
