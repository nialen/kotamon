import { CalendarBlank } from '@phosphor-icons/react/dist/ssr';

type UpdatedAtProps = {
  readonly updatedAt: string;
};

const ENGLISH_DATE = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
});

export function UpdatedAt({ updatedAt }: UpdatedAtProps) {
  const date = new Date(`${updatedAt}T00:00:00Z`);

  return (
    <p className="updated-at">
      <CalendarBlank aria-hidden="true" size={18} weight="bold" />
      <time dateTime={updatedAt}>Updated {ENGLISH_DATE.format(date)}</time>
    </p>
  );
}
