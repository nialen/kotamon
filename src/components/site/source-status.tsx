import {
  Files,
  SealCheck,
  ShieldWarning,
  Stack,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';

import type { SourceStatus as SourceStatusValue } from '@/content/schema';

const STATUS_DETAILS: Record<
  SourceStatusValue,
  { readonly label: string; readonly description: string; readonly icon: Icon }
> = {
  official: {
    label: 'Official source',
    description: 'Supported directly by an official KOTAMON source.',
    icon: SealCheck,
  },
  'multi-source': {
    label: 'Multiple sources',
    description: 'Checked against more than one current source.',
    icon: Stack,
  },
  'single-source': {
    label: 'Single source',
    description: 'Supported by one current source and presented with care.',
    icon: Files,
  },
  unverified: {
    label: 'Unverified',
    description: 'Not yet supported well enough for a public claim.',
    icon: ShieldWarning,
  },
};

type SourceStatusProps = {
  readonly status: SourceStatusValue;
};

export function SourceStatus({ status }: SourceStatusProps) {
  const details = STATUS_DETAILS[status];
  const StatusIcon = details.icon;

  return (
    <details className="source-status">
      <summary>
        <StatusIcon aria-hidden="true" size={18} weight="bold" />
        <span>{details.label}</span>
      </summary>
      <p>{details.description}</p>
    </details>
  );
}
