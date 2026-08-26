import Link from 'next/link';

import { SITE } from '@/lib/site';

export default function NotFound() {
  return (
    <main>
      <h1>Page not found</h1>
      <p>The page you requested is unavailable.</p>
      <Link href="/en">Return to the {SITE.name} homepage</Link>
    </main>
  );
}
