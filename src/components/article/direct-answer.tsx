import type { ReactNode } from 'react';

type DirectAnswerProps = {
  readonly children: ReactNode;
  readonly label?: string;
};

export function DirectAnswer({
  children,
  label = 'Direct answer',
}: DirectAnswerProps) {
  return (
    <aside aria-label={label} className="direct-answer">
      <p className="direct-answer__label">{label}</p>
      <div className="direct-answer__content">{children}</div>
    </aside>
  );
}
