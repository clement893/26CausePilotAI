'use client';

/**
 * Page de connexion - Étape 1.1.3
 * React Hook Form + Zod, AuthCard/AuthInput/AuthButton, callbackUrl, design system
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { AuthCard, AuthInput, AuthButton } from '@/components/auth';
import { useAuthStore } from '@/lib/store';
import { useHydrated } from '@/hooks/useHydrated';
import { TokenStorage } from '@/lib/auth/tokenStorage';
import { authAPI } from '@/lib/api';
import { routing } from '@/i18n/routing';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'CausePilotAI';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const { user, token, isAuthenticated, isAuthInitialized } = useAuthStore();
  const isHydrated = useHydrated();
  const redirectingRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  });

  // Support both callbackUrl (our middleware) and redirect (NextAuth) query params
  const callbackUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('callbackUrl') ??
        new URLSearchParams(window.location.search).get('redirect') ??
        '/dashboard'
      : '/dashboard';

  // If already signed in, redirect to target once (avoid loop)
  // Check Zustand store (source of truth) instead of NextAuth session
  useEffect(() => {
    // Wait for hydration to complete before checking auth
    if (!isHydrated) {
      return;
    }

    const checkAndRedirect = async () => {
      // Prevent multiple simultaneous redirects
      if (redirectingRef.current) {
        return;
      }

      // Wait a bit for AuthInitializer to sync tokens between TokenStorage and Zustand store
      // This prevents redirect loops when tokens exist but store isn't hydrated yet
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check multiple sources of authentication
      const tokenFromStorage = typeof window !== 'undefined' ? TokenStorage.getToken() : null;
      const hasTokenInStore = !!token;
      const hasTokenInStorage = !!tokenFromStorage;
      const hasUserInStore = !!user;
      
      // Check if cookie exists (via API) - middleware might have passed but store not synced yet
      let hasCookie = false;
      if (typeof window !== 'undefined') {
        try {
          hasCookie = await TokenStorage.hasTokensInCookies();
        } catch (err) {
          // Cookie check failed, continue with other checks
        }
      }

      // User is authenticated if:
      // 1. Both token and user exist in store, OR
      // 2. Token exists in storage AND (user exists in store OR cookie exists)
      // The cookie check ensures we don't redirect if middleware passed but store isn't synced
      const hasAuth = 
        (hasTokenInStore && hasUserInStore) || 
        (hasTokenInStorage && (hasUserInStore || hasCookie));

      // Also check isAuthenticated() for additional validation
      const isAuthValid = hasAuth && (isAuthenticated() || hasCookie);

      if (isAuthValid && !redirectingRef.current) {
        redirectingRef.current = true;
        
        // Prevent redirect loops: never redirect to auth pages
        let finalCallbackUrl = callbackUrl;
        if (
          finalCallbackUrl.includes('/auth/login') ||
          finalCallbackUrl.includes('/auth/callback') ||
          finalCallbackUrl.includes('/auth/register')
        ) {
          // Default to dashboard if callbackUrl points to auth page
          const defaultLocale = routing.defaultLocale;
          finalCallbackUrl = defaultLocale === 'en' ? '/dashboard' : `/${defaultLocale}/dashboard`;
        }

        // Use window.location.href for full page reload to ensure middleware sees the cookie
        // This is important because router.replace() is client-side navigation and middleware
        // might not see the cookie set by the OAuth callback
        if (typeof window !== 'undefined') {
          const base = window.location.origin;
          const finalUrl = finalCallbackUrl.startsWith('http')
            ? finalCallbackUrl
            : `${base}${finalCallbackUrl.startsWith('/') ? finalCallbackUrl : `/${finalCallbackUrl}`}`;
          window.location.href = finalUrl;
        }
      }
    };

    checkAndRedirect();
  }, [callbackUrl, router, isHydrated, isAuthInitialized, user, token, isAuthenticated]);

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setError('root', { message: 'Email ou mot de passe incorrect' });
        return;
      }

      // After successful NextAuth login, get JWT token from backend and set cookie
      // This ensures the middleware can verify authentication via access_token cookie
      try {
        const loginResponse = await authAPI.login(data.email, data.password);
        const { access_token, refresh_token, user: userData } = loginResponse.data;

        // Transform user data to store format
        const { transformApiUserToStoreUser } = await import('@/lib/auth/userTransform');
        const userForStore = transformApiUserToStoreUser(userData);

        // Store tokens securely (this also sets the access_token cookie)
        await TokenStorage.setToken(access_token, refresh_token);

        // Update Zustand store
        const { login } = useAuthStore.getState();
        await login(userForStore, access_token, refresh_token);

        // Wait a bit to ensure cookie is set and verified before redirecting
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        // Verify cookie is set before redirecting
        try {
          const cookieVerified = await TokenStorage.hasTokensInCookies();
          if (!cookieVerified) {
            // Retry setting token if cookie not verified
            await TokenStorage.setToken(access_token, refresh_token);
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
        } catch (err) {
          // Continue even if cookie verification fails - token is in storage
          console.warn('Cookie verification failed, proceeding anyway', err);
        }
      } catch (tokenError) {
        // If token fetch fails, log but continue - NextAuth session might be enough
        console.warn('Failed to get JWT token after NextAuth login:', tokenError);
      }

      // Use window.location.href for full page reload to ensure middleware sees the cookie
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const finalUrl = callbackUrl.startsWith('http')
        ? callbackUrl
        : `${base}${callbackUrl.startsWith('/') ? callbackUrl : `/${callbackUrl}`}`;
      
      if (typeof window !== 'undefined') {
        window.location.href = finalUrl;
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('root', { message: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setOauthLoading(true);
    try {
      // Store callbackUrl in sessionStorage so callback can retrieve it
      // The backend will redirect to /auth/callback, and we'll use the stored callbackUrl
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('oauth_callback_url', callbackUrl);
      }
      
      // Use backend custom OAuth instead of NextAuth to ensure proper token handling
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const locale = routing.defaultLocale;
      const callbackPath = `/${locale}/auth/callback`;
      const fullCallbackUrl = `${base}${callbackPath}`;
      
      // Get Google OAuth URL from backend with callback URL
      const response = await authAPI.getGoogleAuthUrl(fullCallbackUrl);
      const authUrl = response.data?.auth_url;
      
      if (!authUrl) {
        setError('root', { message: 'Impossible de générer l\'URL d\'authentification Google' });
        setOauthLoading(false);
        return;
      }
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (err) {
      setError('root', { message: 'Une erreur est survenue lors de la connexion avec Google' });
      setOauthLoading(false);
    }
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{ backgroundColor: 'var(--background-primary, #0A0A0F)' }}
    >
      <AuthCard
        logo={
          <span className="text-xl font-bold text-[var(--text-primary,#FFF)]">
            {APP_NAME}
          </span>
        }
      >
        <h1 className="mb-6 text-center text-2xl font-bold text-[var(--text-primary,#FFF)]">
          Connexion à {APP_NAME}
        </h1>

        {errors.root && (
          <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500" role="alert">
            {errors.root.message}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AuthInput
            label="Email"
            type="email"
            placeholder="vous@exemple.com"
            fullWidth
            error={errors.email?.message}
            {...register('email')}
          />
          <AuthInput
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            fullWidth
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
              <input type="checkbox" className="rounded" {...register('remember')} />
              Se souvenir de moi
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-[var(--color-info,#3B82F6)] hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <AuthButton type="submit" variant="primary" fullWidth loading={loading}>
            Se connecter
          </AuthButton>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[rgba(28,28,38,0.9)] px-2 text-[var(--text-secondary,#A0A0B0)]">
              Ou continuer avec
            </span>
          </div>
        </div>

        <AuthButton
          type="button"
          variant="google"
          fullWidth
          loading={oauthLoading}
          onClick={onGoogle}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          }
        >
          Google
        </AuthButton>

        <p className="mt-6 text-center text-sm text-[var(--text-secondary,#A0A0B0)]">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="text-[var(--color-info,#3B82F6)] hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </AuthCard>
    </main>
  );
}
