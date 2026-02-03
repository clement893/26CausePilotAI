'use client';

/**
 * Intermediate page: set access_token cookie via API then redirect.
 * Used after OAuth callback so the next navigation (dashboard) sends the cookie.
 * Reads token from localStorage (set by callback); does not accept token in URL for security.
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { TokenStorage } from '@/lib/auth/tokenStorage';
import { routing } from '@/i18n/routing';
import Container from '@/components/ui/Container';
import Loading from '@/components/ui/Loading';

export default function SetCookiePage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'setting' | 'done' | 'error'>('setting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const redirect = searchParams.get('redirect') || '/dashboard';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const locale = pathname.match(/^\/(en|fr)\//)?.[1] || routing.defaultLocale;
    const loginPath = locale === routing.defaultLocale ? '/auth/login' : `/${locale}/auth/login`;
    const safeRedirect = redirect.startsWith('http') ? (locale === 'en' ? '/dashboard' : `/${locale}/dashboard`) : redirect.startsWith('/') ? redirect : `/${redirect}`;

    (async () => {
      const token = TokenStorage.getToken();
      const refreshToken = TokenStorage.getRefreshToken();
      if (!token) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage('No token in storage');
        }
        setTimeout(() => {
          window.location.href = `${loginPath}?callbackUrl=${encodeURIComponent(safeRedirect)}`;
        }, 2000);
        return;
      }

      try {
        await TokenStorage.setToken(token, refreshToken ?? undefined);
        if (cancelled) return;
        // Wait for cookie to be visible to the server
        for (let i = 0; i < 15; i++) {
          await new Promise((r) => setTimeout(r, 200));
          if (cancelled) return;
          const ok = await TokenStorage.hasTokensInCookies();
          if (ok) break;
          if (i < 14) await TokenStorage.setToken(token, refreshToken ?? undefined);
        }
        if (cancelled) return;
        setStatus('done');
        await new Promise((r) => setTimeout(r, 400));
        if (cancelled) return;
        const base = window.location.origin;
        const url = safeRedirect.startsWith('http') ? safeRedirect : `${base}${safeRedirect.startsWith('/') ? safeRedirect : `/${safeRedirect}`}`;
        window.location.replace(url);
      } catch (e) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(e instanceof Error ? e.message : 'Failed to set cookie');
        }
        setTimeout(() => {
          window.location.href = `${loginPath}?callbackUrl=${encodeURIComponent(safeRedirect)}`;
        }, 3000);
      }
    })();
    return () => { cancelled = true; };
  }, [searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background-primary,#0A0A0F)]">
      <Container>
        <div className="text-center py-12">
          <Loading />
          <p className="mt-4 text-[var(--text-secondary,#A0A0B0)]">
            {status === 'setting' && 'Configuration de la session…'}
            {status === 'done' && 'Redirection…'}
            {status === 'error' && (errorMessage || 'Erreur. Redirection vers la connexion.')}
          </p>
        </div>
      </Container>
    </main>
  );
}
