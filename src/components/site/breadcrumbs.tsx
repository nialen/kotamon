import { CaretRight, House } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export type BreadcrumbItem = {
  readonly label: string;
  readonly href?: string;
};

type BreadcrumbsProps = {
  readonly items: readonly BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>
        <li>
          <Link aria-label="KOTAMON home" href="/en">
            <House aria-hidden="true" size={16} weight="bold" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={`${item.label}-${item.href ?? 'current'}`}>
              <CaretRight aria-hidden="true" size={14} weight="bold" />
              {item.href && !isCurrent ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span aria-current={isCurrent ? 'page' : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
