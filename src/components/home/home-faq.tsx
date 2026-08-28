import Link from 'next/link';

import { HomeSection } from '@/components/home/home-section';
import { SITE } from '@/lib/site';

const FAQS = [
  {
    question: 'What is KOTAMON?',
    answer: <>A collecting simulation game where you search a garbage dump, find and repair cards, and discover other items. Start with the <Link href="/en/guides/gameplay">gameplay guide</Link>.</>,
  },
  {
    question: 'Is KOTAMON on Steam?',
    answer: <>Yes. The full game is listed for Windows PC on <a href={SITE.steamUrl}>Steam</a>, developed by KotaMota Games and published by Polnoch.</>,
  },
  {
    question: 'Does KOTAMON have a demo?',
    answer: <>A demo preceded the full release. An active demo download has not been confirmed in our current store check; see the <a href={SITE.steamUrl}>official listing</a> for availability.</>,
  },
  {
    question: 'Where can I download KOTAMON?',
    answer: <>Use the <a href={SITE.steamUrl}>official Steam store</a> to buy and install the Windows PC game. Our <Link href="/en/game/where-to-play">platform guide</Link> covers the verified listing and system requirements.</>,
  },
  {
    question: 'What are KOTAMON cards?',
    answer: <>They are in-game collectibles with illustrated artwork, condition and rarity information. Browse the <Link href="/en/cards">card reference</Link> and <Link href="/en/guides/foil-cards">foil card guide</Link>; they are not the same thing as Steam Community Items.</>,
  },
  {
    question: 'Who are the KOTAMON artists?',
    answer: <>KotaMota Games is the verified developer credit. Our sources do not establish a complete list of individual illustrators. The <Link href="/en/game/artists">artists guide</Link> explains how to check the in-game credits.</>,
  },
  {
    question: 'Does KOTAMON have collectibles?',
    answer: <>Yes. Alongside cards, the guides cover <Link href="/en/collectibles/figurines">figurines</Link> and <Link href="/en/collectibles/audiotapes">audiotapes</Link>. The <Link href="/en/achievements">achievement reference</Link> lists their collection milestones.</>,
  },
  {
    question: 'Is this the official KOTAMON wiki?',
    answer: <>No. KOTAMON.com is an independent fan-made guide, not a website affiliated with or endorsed by KotaMota Games or Polnoch. Official game information is linked to its source.</>,
  },
];

export function HomeFaq() {
  return (
    <HomeSection id="home-faq-title" title="KOTAMON FAQ">
      <div className="mt-6 divide-y-2 divide-[var(--border)]">
        {FAQS.map(({ question, answer }) => (
          <details className="group py-5" key={question}>
            <summary className="cursor-pointer text-[var(--foreground-strong)]">
              <h3 className="inline font-display text-lg md:text-xl">{question}</h3>
            </summary>
            <p className="mt-4 max-w-[78ch] font-semibold leading-relaxed text-[var(--muted-foreground)]">{answer}</p>
          </details>
        ))}
      </div>
    </HomeSection>
  );
}
