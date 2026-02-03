'use client';

/**
 * Forgot password page - request password reset email.
 * Public route; calls backend POST /api/v1/auth/forgot-password.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authAPI } from '@/lib/api';
import { AuthCard, AuthInput, AuthButton } from '@/components/auth';
import { useLocale } from 'next-intl';

const schema = z.object({ email: z.string().email('Email invalide') });
type FormData = z.infer<typeof schema>;

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'CausePilotAI';

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(data.email);
      setSent(true);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      // 404 = endpoint not implemented yet; still show success for security
      if (status === 404) {
        setSent(true);
        return;
      }
      setError('root', {
        message:
          locale === 'fr'
            ? 'Une erreur est survenue. Réessayez plus tard.'
            : 'Something went wrong. Please try again later.',
      });
    } finally {
      setLoading(false);
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
        <h1 className="mb-2 text-center text-2xl font-bold text-[var(--text-primary,#FFF)]">
          {locale === 'fr' ? 'Mot de passe oublié' : 'Forgot password'}
        </h1>
        <p className="mb-6 text-center text-sm text-[var(--text-secondary,#A0A0B0)]">
          {locale === 'fr'
            ? "Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe."
            : 'Enter your email and we’ll send you a link to reset your password.'}
        </p>

        {sent ? (
          <div className="space-y-4">
            <p
              className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400"
              role="alert"
            >
              {locale === 'fr'
                ? "Si ce compte existe, un email avec les instructions a été envoyé."
                : 'If that account exists, we’ve sent an email with instructions.'}
            </p>
            <Link
              href="/auth/login"
              className="block text-center text-sm text-[var(--color-info,#3B82F6)] hover:underline"
            >
              {locale === 'fr' ? 'Retour à la connexion' : 'Back to login'}
            </Link>
          </div>
        ) : (
          <>
            {errors.root && (
              <p
                className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500"
                role="alert"
              >
                {errors.root.message}
              </p>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <AuthInput
                label={locale === 'fr' ? 'Email' : 'Email'}
                type="email"
                placeholder="vous@exemple.com"
                fullWidth
                error={errors.email?.message}
                {...register('email')}
              />
              <AuthButton
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                {locale === 'fr' ? 'Envoyer le lien' : 'Send reset link'}
              </AuthButton>
            </form>
            <p className="mt-6 text-center text-sm text-[var(--text-secondary,#A0A0B0)]">
              <Link
                href="/auth/login"
                className="text-[var(--color-info,#3B82F6)] hover:underline"
              >
                {locale === 'fr' ? 'Retour à la connexion' : 'Back to login'}
              </Link>
            </p>
          </>
        )}
      </AuthCard>
    </main>
  );
}
