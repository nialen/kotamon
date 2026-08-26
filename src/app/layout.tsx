import type { Metadata } from 'next';
import { Bungee, Nunito_Sans } from 'next/font/google';
import type { ReactNode } from 'react';

import { SITE } from '@/lib/site';
import { THEME_BOOT_SCRIPT } from '@/lib/theme';

import './globals.css';

const displayFont = Bungee({
  subsets: ['latin'],
  variable: '--font-kotamon-display',
  weight: '400',
});

const bodyFont = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-kotamon-body',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.positioning,
  icons: {
    apple: SITE.icons.appleTouch,
    icon: [SITE.icons.favicon16, SITE.icons.favicon32],
  },
};

type RootLayoutProps = {
  readonly children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang={SITE.locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
