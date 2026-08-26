import type { MDXComponents } from 'mdx/types';

import { TableOfContents } from '@/components/article/table-of-contents';
import { AchievementGroups } from '@/components/content/achievement-groups';
import { CardGroups } from '@/components/content/card-groups';
import { LocationChecklist } from '@/components/content/location-checklist';

const components: MDXComponents = {
  AchievementGroups,
  CardGroups,
  LocationChecklist,
  TableOfContents,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
