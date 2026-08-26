import { SITE } from './site';

export function isSupportedLocale(locale: string): locale is typeof SITE.locale {
  return locale === SITE.locale;
}
