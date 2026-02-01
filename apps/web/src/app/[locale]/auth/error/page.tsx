'use client';

/**
 * Page d'erreur d'authentification - Étape 1.1.3
 * Affiche le message selon ?error=CredentialsSignin, etc.
 */

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthCard, AuthButton } from '@/components/auth';

const errorMessages: Record<string, string> = {
  CredentialsSignin: 'Email ou mot de passe incorrect',
  OAuthAccountNotLinked:
    "Ce compte email est déjà utilisé avec une autre méthode de connexion",
  EmailSignin: "Erreur lors de l'envoi de l'email de vérification",
  Callback: 'Erreur lors de la connexion',
  Default: 'Une erreur est survenue. Veuillez réessayer.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('error') ?? 'Default';
  const message = errorMessages[errorType] ?? errorMessages.Default;

  return (
    <main
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: 'var(--background-primary, #0A0A0F)' }}
    >
      <AuthCard>
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20"
            aria-hidden
          >
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary,#FFF)]">
            Erreur d&apos;authentification
          </h1>
          <p className="mb-8 text-[var(--text-secondary,#A0A0B0)]">{message}</p>
          <Link href="/auth/login" className="w-full sm:w-auto">
            <AuthButton variant="primary" fullWidth>
              Retour à la connexion
            </AuthButton>
          </Link>
        </div>
      </AuthCard>
    </main>
  );
}
