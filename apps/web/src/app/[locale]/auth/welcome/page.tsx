'use client';

/**
 * Page de bienvenue (onboarding) - Étape 1.1.3
 * Après inscription, quick tour + accès au tableau de bord
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthCard, AuthButton } from '@/components/auth';
import { Users, Target, BarChart3 } from 'lucide-react';

export default function AuthWelcomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: 'var(--background-primary, #0A0A0F)' }}
    >
      <AuthCard
        className={`transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20"
            aria-hidden
          >
            <svg
              className="h-8 w-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary,#FFF)]">
            Bienvenue sur Nucleus Cause !
          </h1>
          <p className="mb-8 text-[var(--text-secondary,#A0A0B0)]">
            Votre compte a été créé avec succès. Vous pouvez maintenant commencer
            à gérer vos campagnes de collecte de fonds.
          </p>

          <div className="mb-8 grid w-full gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-0.5">
              <Users className="mb-2 h-6 w-6 text-[var(--color-primary,#667EEA)]" />
              <p className="font-medium text-[var(--text-primary,#FFF)]">
                Gérez vos donateurs
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-0.5">
              <Target className="mb-2 h-6 w-6 text-[var(--color-primary,#667EEA)]" />
              <p className="font-medium text-[var(--text-primary,#FFF)]">
                Créez des campagnes
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-0.5">
              <BarChart3 className="mb-2 h-6 w-6 text-[var(--color-primary,#667EEA)]" />
              <p className="font-medium text-[var(--text-primary,#FFF)]">
                Analysez vos résultats
              </p>
            </div>
          </div>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <AuthButton type="submit" variant="primary" fullWidth>
              Accéder au tableau de bord
            </AuthButton>
          </Link>
          <p className="mt-4 text-xs text-[var(--text-tertiary,#6B6B7B)]">
            Redirection automatique dans 5 secondes…
          </p>
        </div>
      </AuthCard>
    </main>
  );
}
