'use client';

import { Moon, Sun } from '@phosphor-icons/react';
import { useSyncExternalStore } from 'react';

import { THEME_STORAGE_KEY } from '@/lib/theme';

const THEME_CHANGE_EVENT = 'kotamon-theme-change';

type Theme = 'light' | 'dark';

function getStoredTheme(): Theme | null {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === 'light' || storedTheme === 'dark'
      ? storedTheme
      : null;
  } catch {
    return null;
  }
}

function getResolvedTheme(): Theme {
  const rootTheme = document.documentElement.dataset.theme;

  if (rootTheme === 'light' || rootTheme === 'dark') {
    return rootTheme;
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getServerTheme(): null {
  return null;
}

function subscribeToTheme(onStoreChange: () => void) {
  const colorScheme = window.matchMedia?.('(prefers-color-scheme: dark)');
  const handleColorSchemeChange = (event: MediaQueryListEvent) => {
    if (getStoredTheme() !== null) {
      return;
    }

    document.documentElement.dataset.theme = event.matches ? 'dark' : 'light';
    onStoreChange();
  };

  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  colorScheme?.addEventListener('change', handleColorSchemeChange);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    colorScheme?.removeEventListener('change', handleColorSchemeChange);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(
    subscribeToTheme,
    getResolvedTheme,
    getServerTheme,
  );

  function toggleTheme() {
    const nextTheme: Theme = getResolvedTheme() === 'dark' ? 'light' : 'dark';

    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Storage can be unavailable in privacy modes. The active page theme still changes.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  const isDark = theme === 'dark';
  const label = theme
    ? `Switch to ${isDark ? 'light' : 'dark'} theme`
    : 'Toggle color theme';

  return (
    <button
      aria-label={label}
      aria-pressed={theme ? isDark : undefined}
      className="theme-toggle"
      onClick={toggleTheme}
      type="button"
    >
      <Sun aria-hidden="true" className="theme-toggle__sun" size={19} weight="bold" />
      <Moon aria-hidden="true" className="theme-toggle__moon" size={19} weight="bold" />
    </button>
  );
}
