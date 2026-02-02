'use client';

/**
 * Shared OAuth callback view used by both:
 * - /auth/callback (non-localized, e.g. after middleware strips /en)
 * - /[locale]/auth/callback (localized)
 * Using the same component on both routes avoids redirect loops when
 * next-intl rewrites /en/auth/callback to /auth/callback (default locale).
 */
import { Suspense, useEffect, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { TokenStorage } from '@/lib/auth/tokenStorage';
import { transformApiUserToStoreUser } from '@/lib/auth/userTransform';
import { usersAPI } from '@/lib/api';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/errors/api';
import Container from '@/components/ui/Container';
import Loading from '@/components/ui/Loading';
import Card from '@/components/ui/Card';
import { routing } from '@/i18n/routing';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAuthCallback = useCallback(async () => {
    if (isProcessing) {
      logger.debug('Callback already processing, skipping');
      return;
    }

    setIsProcessing(true);
    let accessToken: string | null = null;
    let refreshToken: string | undefined = undefined;
    let callbackUrl: string | null = null;

    accessToken = searchParams.get('token') || searchParams.get('access_token');
    refreshToken = searchParams.get('refresh_token') ?? undefined;
    
    // Try to get callbackUrl from URL params (but not from 'state' which contains the callback URL itself)
    callbackUrl = searchParams.get('callbackUrl') || searchParams.get('redirect');

    if (!accessToken && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      accessToken = urlParams.get('token') || urlParams.get('access_token');
      refreshToken = urlParams.get('refresh_token') ?? undefined;
      if (!callbackUrl) {
        callbackUrl = urlParams.get('callbackUrl') || urlParams.get('redirect');
      }
    }

    // Priority: sessionStorage (stored before OAuth redirect) > URL params
    // The 'state' param contains the callback URL, not the destination, so we ignore it
    if (typeof window !== 'undefined') {
      const storedCallbackUrl = sessionStorage.getItem('oauth_callback_url');
      if (storedCallbackUrl) {
        callbackUrl = storedCallbackUrl;
        sessionStorage.removeItem('oauth_callback_url');
      }
    }

    logger.info('Auth callback started', {
      hasToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      callbackUrl,
      urlParams: Object.fromEntries(searchParams.entries()),
      windowSearch: typeof window !== 'undefined' ? window.location.search : 'N/A',
      windowHref: typeof window !== 'undefined' ? window.location.href : 'N/A',
      sessionStorageCallbackUrl: typeof window !== 'undefined' ? sessionStorage.getItem('oauth_callback_url') : 'N/A',
    });

    if (!accessToken) {
      logger.error('No access token provided in callback URL', {
        searchParamsEntries: Object.fromEntries(searchParams.entries()),
        windowLocation: typeof window !== 'undefined' ? window.location.href : 'N/A',
        windowSearch: typeof window !== 'undefined' ? window.location.search : 'N/A',
      });
      router.push('/auth/login?error=No access token provided');
      return;
    }

    try {
      logger.debug('Storing token...');
      await TokenStorage.setToken(accessToken, refreshToken);
      logger.info('Tokens stored successfully');

      await new Promise((resolve) => setTimeout(resolve, 100));

      const storedToken = TokenStorage.getToken();
      logger.debug('Token verification', {
        hasStoredToken: !!storedToken,
        tokenMatches: storedToken === accessToken,
      });

      const storedTokenBeforeCall = TokenStorage.getToken();
      if (!storedTokenBeforeCall || storedTokenBeforeCall !== accessToken) {
        if (process.env.NODE_ENV === 'development') {
          logger.warn('Token mismatch before API call, re-storing...', {
            storedTokenExists: !!storedTokenBeforeCall,
            tokensMatch: storedTokenBeforeCall === accessToken,
          });
        }
        await TokenStorage.setToken(accessToken, refreshToken);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const response = await usersAPI.getMe();
      logger.info('User info received', {
        hasUser: !!response.data,
        userEmail: response.data?.email,
        status: response.status,
      });

      const user = response.data;

      if (user) {
        logger.info('Logging in user', { userId: user.id, email: user.email });

        const userForStore = transformApiUserToStoreUser(user);

        await login(userForStore, accessToken, refreshToken ?? undefined);

        const storedToken = TokenStorage.getToken();
        logger.debug('Login verification', {
          tokenStored: !!storedToken,
          tokenMatches: storedToken === accessToken,
        });

        // Verify that cookie is set before redirecting (important for middleware)
        // The cookie is set via /api/auth/token, so we verify it's present
        let cookieVerified = false;
        if (typeof window !== 'undefined') {
          try {
            // Wait a bit more to ensure cookie is set
            await new Promise((resolve) => setTimeout(resolve, 200));
            
            // Verify cookie is set via API
            const cookieCheck = await TokenStorage.hasTokensInCookies();
            cookieVerified = cookieCheck;
            
            if (!cookieVerified) {
              logger.warn('Cookie not verified, retrying token storage...');
              // Retry setting token
              await TokenStorage.setToken(accessToken, refreshToken);
              await new Promise((resolve) => setTimeout(resolve, 200));
              cookieVerified = await TokenStorage.hasTokensInCookies();
            }
            
            logger.debug('Cookie verification', {
              cookieVerified,
              hasTokenInStorage: !!storedToken,
            });
          } catch (error) {
            logger.warn('Failed to verify cookie, proceeding anyway', error);
            // Continue even if cookie verification fails - token is in storage
            cookieVerified = true;
          }
        }

        // Detect current locale from URL (e.g., /fr/auth/callback -> 'fr', /auth/callback -> 'en')
        let currentLocale = routing.defaultLocale;
        if (typeof window !== 'undefined') {
          const pathMatch = window.location.pathname.match(/^\/(en|fr)\//);
          if (pathMatch) {
            currentLocale = pathMatch[1] as 'en' | 'fr';
          }
        }
        
        logger.debug('Locale detection', {
          pathname: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
          detectedLocale: currentLocale,
          defaultLocale: routing.defaultLocale,
        });
        
        // Build default dashboard URL with current locale
        const defaultDashboard = currentLocale === 'en' ? '/dashboard' : `/${currentLocale}/dashboard`;

        let redirectUrl = callbackUrl || defaultDashboard;
        
        // If callbackUrl is a full URL, extract just the path
        if (redirectUrl.startsWith('http')) {
          try {
            const url = new URL(redirectUrl);
            redirectUrl = url.pathname + url.search;
          } catch {
            // If URL parsing fails, use default dashboard
            redirectUrl = defaultDashboard;
          }
        }
        
        // Ensure redirectUrl uses the correct locale if it's a relative path without locale prefix
        if (redirectUrl.startsWith('/') && !redirectUrl.startsWith('/en/') && !redirectUrl.startsWith('/fr/')) {
          // If redirectUrl doesn't have locale prefix, add current locale (unless it's default 'en')
          if (currentLocale !== 'en') {
            redirectUrl = `/${currentLocale}${redirectUrl}`;
          }
        }
        
        if (redirectUrl.includes('/auth/callback') || redirectUrl.includes('/auth/login')) {
          logger.warn('Preventing redirect loop - callbackUrl points to auth page, using default dashboard', {
            callbackUrl,
            redirectUrl: defaultDashboard,
          });
          redirectUrl = defaultDashboard;
        }

        logger.info('Redirecting after authentication', {
          redirectUrl,
          callbackUrl,
          defaultDashboard,
        });

        await new Promise((resolve) => setTimeout(resolve, 300));

        const base = typeof window !== 'undefined' ? window.location.origin : '';
        const finalRedirectUrl = redirectUrl.startsWith('http')
          ? redirectUrl
          : `${base}${redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`}`;

        logger.info('Performing final redirect', { finalRedirectUrl });
        window.location.href = finalRedirectUrl;
      } else {
        throw new Error('No user data received');
      }
    } catch (err: unknown) {
      const appError = handleApiError(err);
      logger.error(
        'Failed to complete authentication',
        appError instanceof Error ? appError : new Error(String(err)),
        {
          errorMessage: appError.message,
          errorCode: appError.code,
          errorDetails: appError.details,
        }
      );
      router.push(
        `/auth/login?error=${encodeURIComponent(appError.message || 'Failed to get user info')}`
      );
    } finally {
      setIsProcessing(false);
    }
  }, [searchParams, router, login, isProcessing]);

  useEffect(() => {
    handleAuthCallback();
  }, [handleAuthCallback]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 from-[#1C1C26] to-[#1C1C26]">
      <Container>
        <Card className="text-center">
          <div className="py-12">
            <Loading />
            <p className="mt-4 text-gray-400">Completing authentication...</p>
          </div>
        </Card>
      </Container>
    </main>
  );
}

const Fallback = () => (
  <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 from-[#1C1C26] to-[#1C1C26]">
    <Container>
      <Card className="text-center">
        <div className="py-12">
          <Loading />
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </Card>
    </Container>
  </main>
);

export function AuthCallbackView() {
  return (
    <Suspense fallback={<Fallback />}>
      <CallbackContent />
    </Suspense>
  );
}
