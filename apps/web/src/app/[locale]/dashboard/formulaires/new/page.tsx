'use client';

/**
 * Form Builder - Nouveau formulaire de don - Étape 2.1.3
 * Créateur de formulaire en 6 étapes avec preview en temps réel.
 */

import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useOrganization } from '@/hooks/useOrganization';
import { FormBuilderWizard } from '@/components/donation-forms';
import { DEFAULT_DONATION_FORM_DRAFT } from '@/lib/types/donation-form';
import { ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function NewDonationFormPage() {
  const router = useRouter();
  const { activeOrganization, isLoading } = useOrganization();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 h-8 w-64 animate-pulse rounded bg-white/10" />
          <div className="h-96 animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>
    );
  }

  if (!activeOrganization) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-[var(--text-secondary,#A0A0B0)]">Aucune organisation active</p>
          <Link href="/dashboard" className="mt-4 inline-block text-[var(--color-primary,#3B82F6)] hover:underline">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const initialData = DEFAULT_DONATION_FORM_DRAFT(activeOrganization.id);

  return (
    <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/dashboard/formulaires/formulaires" className="hover:text-white">Formulaires</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Nouveau formulaire</span>
        </nav>
        <h1 className="mb-2 text-2xl font-bold text-white">Créer un formulaire de don</h1>
        <p className="mb-8 text-sm text-[var(--text-secondary,#A0A0B0)]">
          Configurez votre formulaire en 6 étapes. La preview se met à jour en temps réel.
        </p>
        <FormBuilderWizard
          initialData={initialData}
          onSuccess={(id) => router.push(`/dashboard/formulaires/${id}/edit`)}
        />
      </div>
    </div>
  );
}
