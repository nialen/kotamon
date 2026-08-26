import '@testing-library/jest-dom/vitest';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { THEME_BOOT_SCRIPT } from '@/lib/theme';

function installColorSchemePreference(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue({ matches }),
  });
}

function runProductionThemeBoot() {
  window.eval(THEME_BOOT_SCRIPT);
}

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('THEME_BOOT_SCRIPT', () => {
  it('uses the stored preference before the system preference', () => {
    installColorSchemePreference(true);
    window.localStorage.setItem('kotamon-theme', 'light');

    runProductionThemeBoot();

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it.each([
    [true, 'dark'],
    [false, 'light'],
  ] as const)(
    'falls back to the system preference when dark matching is %s',
    (matches, expectedTheme) => {
      installColorSchemePreference(matches);

      runProductionThemeBoot();

      expect(document.documentElement).toHaveAttribute(
        'data-theme',
        expectedTheme,
      );
    },
  );
});
