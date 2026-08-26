import { describe, expect, it } from 'vitest';

import { isSupportedLocale } from '@/lib/locale';

describe('isSupportedLocale', () => {
  it('accepts only the canonical English locale', () => {
    expect(isSupportedLocale('en')).toBe(true);
    expect(isSupportedLocale('EN')).toBe(false);
    expect(isSupportedLocale('en-US')).toBe(false);
    expect(isSupportedLocale('fr')).toBe(false);
    expect(isSupportedLocale('')).toBe(false);
  });
});
