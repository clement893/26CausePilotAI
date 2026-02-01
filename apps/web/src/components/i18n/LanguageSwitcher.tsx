/**
 * Language Switcher Component
 *
 * Allows users to switch between available languages (English, French).
 * Uses window.location for navigation.
 *
 * @example
 * ```tsx
 * <LanguageSwitcher />
 * ```
 *
 * @see LocaleSwitcher - Alternative implementation using Next.js router
 */
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { locales, localeNames, localeNativeNames, isRTL, type Locale } from '@/i18n/routing';
import { useState } from 'react';
import { Globe, Check } from '@/lib/icons';
import Button from '@/components/ui/Button';
import { clsx } from 'clsx';

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations('language');
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: Locale) => {
    setIsOpen(false);

    // Use next-intl's navigation helper
    const { pathname: currentPath } = window.location;
    const pathWithoutLocale = currentPath.replace(/^\/(en|fr)/, '') || '/';

    // Build new path with locale
    const newPath = newLocale === 'en' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`;

    // Navigate to new locale
    window.location.href = newPath;
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border-gray-700 text-gray-300 hover:bg-[#252532] hover:text-white"
        aria-label={t('switchLanguage')}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <span className="sm:hidden">{locale.toUpperCase()}</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 glass-effect bg-[#1C1C26] rounded-lg shadow-lg border border-gray-800 z-20">
            <div className="py-1">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  className={clsx(
                    'w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-[#252532] transition-colors text-gray-300',
                    locale === loc && 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white'
                  )}
                  dir={isRTL(loc) ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{localeNativeNames[loc]}</span>
                    <span className="text-xs text-gray-400">{localeNames[loc]}</span>
                  </div>
                  {locale === loc && (
                    <Check className="w-4 h-4 text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
