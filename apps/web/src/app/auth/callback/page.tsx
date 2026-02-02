'use client';

/**
 * Redirect /auth/callback to locale-specific route
 * With next-intl, auth routes should be under [locale]
 * This prevents redirect loops when backend redirects to /auth/callback
 */
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default function CallbackRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve all query parameters when redirecting to localized route
    const params = new URLSearchParams();
    
    // Copy all search params
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    const queryString = params.toString();
    const redirectUrl = `/${routing.defaultLocale}/auth/callback${queryString ? `?${queryString}` : ''}`;
    
    // Use replace to avoid adding to history
    router.replace(redirectUrl);
  }, [router, searchParams]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <div className="text-xl text-gray-400">Redirecting...</div>
      </div>
    </div>
  );
}
