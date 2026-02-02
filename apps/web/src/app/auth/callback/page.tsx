'use client';

/**
 * OAuth callback at /auth/callback (no locale prefix).
 * Renders the same view as /[locale]/auth/callback so that when next-intl
 * rewrites /en/auth/callback to /auth/callback, the user lands here and
 * the callback runs without any redirect (avoids ERR_TOO_MANY_REDIRECTS).
 */
import { AuthCallbackView } from '@/components/auth/AuthCallbackView';

export default function CallbackPage() {
  return <AuthCallbackView />;
}
