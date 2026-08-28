import type { ComponentType } from 'react';
import CollectiblesHub, { frontmatter as collectiblesFrontmatter } from '../../content/en/collectibles/index.mdx';
import GameHub, { frontmatter as gameFrontmatter } from '../../content/en/game/index.mdx';
import SystemRequirements, { frontmatter as requirementsFrontmatter } from '../../content/en/game/system-requirements.mdx';
import Updates, { frontmatter as updatesIndexFrontmatter } from '../../content/en/updates/index.mdx';
import GuidesHub, { frontmatter as guidesFrontmatter } from '../../content/en/guides/index.mdx';
import BeginnerGuide, { frontmatter as beginnerFrontmatter } from '../../content/en/guides/beginner-guide.mdx';
import MoneyGuide, { frontmatter as moneyFrontmatter } from '../../content/en/guides/money.mdx';
import UpgradesGuide, { frontmatter as upgradesFrontmatter } from '../../content/en/guides/upgrades.mdx';

import AchievementsReference, {
  frontmatter as achievementsFrontmatter,
} from '../../content/en/achievements/index.mdx';
import CardsReference, {
  frontmatter as cardsFrontmatter,
} from '../../content/en/cards/index.mdx';
import AudiotapesGuide, {
  frontmatter as audiotapesFrontmatter,
} from '../../content/en/collectibles/audiotapes.mdx';
import FigurinesGuide, {
  frontmatter as figurinesFrontmatter,
} from '../../content/en/collectibles/figurines.mdx';
import ArtistsGuide, {
  frontmatter as artistsFrontmatter,
} from '../../content/en/game/artists.mdx';
import WhereToPlayGuide, {
  frontmatter as whereToPlayFrontmatter,
} from '../../content/en/game/where-to-play.mdx';
import CardRepairGuide, {
  frontmatter as cardRepairFrontmatter,
} from '../../content/en/guides/card-repair.mdx';
import CerealBoxesGuide, {
  frontmatter as cerealBoxesFrontmatter,
} from '../../content/en/guides/cereal-boxes.mdx';
import FoilCardsGuide, {
  frontmatter as foilCardsFrontmatter,
} from '../../content/en/guides/foil-cards.mdx';
import GameplayGuide, {
  frontmatter as gameplayFrontmatter,
} from '../../content/en/guides/gameplay.mdx';
import SaveNotWorkingGuide, {
  frontmatter as saveNotWorkingFrontmatter,
} from '../../content/en/guides/save-not-working.mdx';
import SecretLocationGuide, {
  frontmatter as secretLocationFrontmatter,
} from '../../content/en/guides/secret-location.mdx';

export type MdxContentModule = {
  default: ComponentType;
  frontmatter: unknown;
  sourcePath: string;
};

export const contentModules: readonly MdxContentModule[] = [
  {
    default: GameplayGuide,
    frontmatter: gameplayFrontmatter,
    sourcePath: 'content/en/guides/gameplay.mdx',
  },
  {
    default: CardRepairGuide,
    frontmatter: cardRepairFrontmatter,
    sourcePath: 'content/en/guides/card-repair.mdx',
  },
  {
    default: FoilCardsGuide,
    frontmatter: foilCardsFrontmatter,
    sourcePath: 'content/en/guides/foil-cards.mdx',
  },
  {
    default: CerealBoxesGuide,
    frontmatter: cerealBoxesFrontmatter,
    sourcePath: 'content/en/guides/cereal-boxes.mdx',
  },
  {
    default: SaveNotWorkingGuide,
    frontmatter: saveNotWorkingFrontmatter,
    sourcePath: 'content/en/guides/save-not-working.mdx',
  },
  {
    default: SecretLocationGuide,
    frontmatter: secretLocationFrontmatter,
    sourcePath: 'content/en/guides/secret-location.mdx',
  },
  {
    default: CardsReference,
    frontmatter: cardsFrontmatter,
    sourcePath: 'content/en/cards/index.mdx',
  },
  {
    default: FigurinesGuide,
    frontmatter: figurinesFrontmatter,
    sourcePath: 'content/en/collectibles/figurines.mdx',
  },
  {
    default: AudiotapesGuide,
    frontmatter: audiotapesFrontmatter,
    sourcePath: 'content/en/collectibles/audiotapes.mdx',
  },
  {
    default: AchievementsReference,
    frontmatter: achievementsFrontmatter,
    sourcePath: 'content/en/achievements/index.mdx',
  },
  {
    default: WhereToPlayGuide,
    frontmatter: whereToPlayFrontmatter,
    sourcePath: 'content/en/game/where-to-play.mdx',
  },
  {
    default: ArtistsGuide,
    frontmatter: artistsFrontmatter,
    sourcePath: 'content/en/game/artists.mdx',
  },
  { default: GuidesHub, frontmatter: guidesFrontmatter, sourcePath: 'content/en/guides/index.mdx' },
  { default: BeginnerGuide, frontmatter: beginnerFrontmatter, sourcePath: 'content/en/guides/beginner-guide.mdx' },
  { default: MoneyGuide, frontmatter: moneyFrontmatter, sourcePath: 'content/en/guides/money.mdx' },
  { default: UpgradesGuide, frontmatter: upgradesFrontmatter, sourcePath: 'content/en/guides/upgrades.mdx' },
  { default: CollectiblesHub, frontmatter: collectiblesFrontmatter, sourcePath: 'content/en/collectibles/index.mdx' },
  { default: GameHub, frontmatter: gameFrontmatter, sourcePath: 'content/en/game/index.mdx' },
  { default: SystemRequirements, frontmatter: requirementsFrontmatter, sourcePath: 'content/en/game/system-requirements.mdx' },
  { default: Updates, frontmatter: updatesIndexFrontmatter, sourcePath: 'content/en/updates/index.mdx' },
];
