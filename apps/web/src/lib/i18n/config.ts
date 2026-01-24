/**
 * Internationalization Configuration
 * Custom i18n implementation without next-intl dependency
 */

import type { Locale } from './messages';

// Supported locales
export const locales = ['fr', 'en'] as const;
export const supportedLocales = locales;

export const defaultLocale: Locale = 'fr';

// Locale display names
export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
};
