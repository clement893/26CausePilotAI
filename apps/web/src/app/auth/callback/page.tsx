/**
 * Redirect /auth/callback to locale-specific route
 * With next-intl, auth routes should be under [locale]
 * This prevents redirect loops when backend redirects to /auth/callback
 */
import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default function CallbackRedirect({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Preserve all query parameters when redirecting to localized route
  const params = new URLSearchParams();
  
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else {
        params.append(key, value);
      }
    }
  });

  const queryString = params.toString();
  const redirectUrl = `/${routing.defaultLocale}/auth/callback${queryString ? `?${queryString}` : ''}`;
  
  redirect(redirectUrl);
}
