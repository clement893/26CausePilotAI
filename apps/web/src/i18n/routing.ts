/**
 * i18n Routing Configuration
 * Defines supported locales and routing behavior
 */

import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

// Supported locales
export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

// RTL locales (none for now, only EN and FR)
export const rtlLocales: Locale[] = [];

// Locale display names
export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};

// Locale native names
export const localeNativeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};

// Check if locale is RTL
export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

// Routing configuration
export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',

  // Locale prefix strategy
  localePrefix: {
    mode: 'as-needed', // Only show locale prefix when not default
    prefixes: {
      en: '', // English has no prefix
      fr: '/fr',
    },
  },
});

// Typed navigation helpers
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
