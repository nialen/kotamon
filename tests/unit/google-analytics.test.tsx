import '@testing-library/jest-dom/vitest';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GoogleAnalytics } from '@/components/analytics/google-analytics';

describe('GoogleAnalytics', () => {
  it('renders no tracking scripts without a valid GA4 measurement ID', () => {
    const { rerender } = render(<GoogleAnalytics />);

    expect(document.querySelectorAll('[data-kotamon-analytics]')).toHaveLength(0);

    rerender(<GoogleAnalytics measurementId="15501944042" />);
    expect(document.querySelectorAll('[data-kotamon-analytics]')).toHaveLength(0);
  });

  it('loads gtag and configures the approved GA4 measurement ID', () => {
    const { container } = render(
      <GoogleAnalytics measurementId="G-ABC123XYZ9" />,
    );

    const loader = document.querySelector(
      'script[data-kotamon-analytics="loader"]',
    );
    const config = container.querySelector(
      'script[data-kotamon-analytics="config"]',
    );

    expect(loader).toHaveAttribute(
      'src',
      'https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ9',
    );
    expect(loader).toHaveAttribute('async');
    expect(config?.textContent).toContain("gtag('config', 'G-ABC123XYZ9')");
  });
});
