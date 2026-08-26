export type TableOfContentsItem = {
  readonly id: string;
  readonly label: string;
  readonly level?: 2 | 3;
};

type TableOfContentsProps = {
  readonly items: readonly TableOfContentsItem[];
};

export function TableOfContents({ items }: TableOfContentsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <details className="table-of-contents" open>
      <summary>On this page</summary>
      <nav aria-label="Table of contents">
        <ol>
          {items.map((item) => (
            <li
              className={item.level === 3 ? 'table-of-contents__nested' : undefined}
              key={item.id}
            >
              <a href={`#${item.id}`}>{item.label}</a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
